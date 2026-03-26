package bot.cline.ide.grpc

import bot.cline.host.proto.*
import com.intellij.openapi.diagnostic.Logger
import com.intellij.diff.DiffManager
import com.intellij.diff.DiffManagerEx
import com.intellij.diff.contents.DocumentContentImpl
import com.intellij.diff.requests.SimpleDiffRequest
import com.intellij.openapi.application.ApplicationManager
import com.intellij.openapi.command.WriteCommandAction
import com.intellij.openapi.editor.Editor
import com.intellij.openapi.editor.EditorFactory
import com.intellij.openapi.editor.LogicalPosition
import com.intellij.openapi.editor.ScrollType
import com.intellij.openapi.fileEditor.FileDocumentManager
import com.intellij.openapi.project.Project
import com.intellij.openapi.util.Computable
import com.intellij.openapi.vfs.LocalFileSystem
import bot.cline.ide.EdtDispatcher
import kotlinx.coroutines.withContext
import java.util.concurrent.ConcurrentHashMap

class DiffServiceImpl(private val project: Project) : DiffServiceGrpcKt.DiffServiceCoroutineImplBase() {

    companion object {
        private val LOG = Logger.getInstance(DiffServiceImpl::class.java)
    }

    // diff_id(파일 경로)를 diff 뷰에 표시되는 인메모리 "수정됨" 문서에 매핑.
    // replaceText/truncateDocument/scrollDiff가 라이브 diff 패널을 업데이트할 수 있도록 유지.
    private val diffDocuments = ConcurrentHashMap<String, com.intellij.openapi.editor.Document>()

    override suspend fun openDiff(request: OpenDiffRequest): OpenDiffResponse {
        val filePath = request.path ?: "unknown"
        try {
            withContext(EdtDispatcher) {
                // "원본"(왼쪽) 사이드를 위해 현재 파일 내용을 읽음.
                val originalContent = ApplicationManager.getApplication().runReadAction(Computable {
                    val vFile = LocalFileSystem.getInstance().findFileByPath(filePath)
                    if (vFile != null) FileDocumentManager.getInstance().getDocument(vFile)?.text ?: "" else ""
                })

                val originalDoc = EditorFactory.getInstance().createDocument(originalContent)
                val modifiedDoc = EditorFactory.getInstance().createDocument(request.content ?: "")

                // 스트리밍 업데이트가 적용될 수 있도록 수정된 문서를 추적.
                diffDocuments[filePath] = modifiedDoc

                val diffRequest = SimpleDiffRequest(
                    "Cline: $filePath",
                    DocumentContentImpl(project, originalDoc, null),
                    DocumentContentImpl(project, modifiedDoc, null),
                    "원본",
                    "수정됨 (에이전트)"
                )
                DiffManager.getInstance().showDiff(project, diffRequest)
            }
        } catch (e: Exception) {
            LOG.warn("[Cline] openDiff error (non-fatal): ${e.message}")
            e.printStackTrace()
            // 에러가 발생해도 diffId를 반환하여 후속 처리가 진행되도록 함
        }
        return OpenDiffResponse.newBuilder().setDiffId(filePath).build()
    }

    override suspend fun getDocumentText(request: GetDocumentTextRequest): GetDocumentTextResponse {
        val diffId = request.diffId?.takeIf { it.isNotEmpty() }
            ?: return GetDocumentTextResponse.getDefaultInstance()

        return try {
            val content = ApplicationManager.getApplication().runReadAction(Computable {
                // 추적 중인 인메모리 문서("수정됨" 사이드)를 우선 사용.
                val tracked = diffDocuments[diffId]
                if (tracked != null) {
                    tracked.text
                } else {
                    // 디스크 상의 문서로 폴백.
                    val vFile = LocalFileSystem.getInstance().findFileByPath(diffId)
                    if (vFile != null) FileDocumentManager.getInstance().getDocument(vFile)?.text ?: "" else ""
                }
            })
            GetDocumentTextResponse.newBuilder().setContent(content).build()
        } catch (e: Exception) {
            LOG.warn("[Cline] getDocumentText error (non-fatal): ${e.message}")
            GetDocumentTextResponse.newBuilder().setContent("").build()
        }
    }

    override suspend fun replaceText(request: ReplaceTextRequest): ReplaceTextResponse {
        val diffId = request.diffId?.takeIf { it.isNotEmpty() }
            ?: return ReplaceTextResponse.getDefaultInstance()
        val doc = diffDocuments[diffId] ?: return ReplaceTextResponse.getDefaultInstance()

        try {
            withContext(EdtDispatcher) {
                WriteCommandAction.runWriteCommandAction(project, "Cline replaceText", null, Runnable {
                    val lineCount = doc.lineCount
                    if (lineCount == 0) {
                        doc.setText(request.content ?: "")
                        return@Runnable
                    }
                    val startLine = request.startLine.coerceIn(0, lineCount - 1)
                    val endLine = request.endLine.coerceIn(startLine, lineCount - 1)
                    val startOffset = doc.getLineStartOffset(startLine)
                    val endOffset = doc.getLineEndOffset(endLine)
                    doc.replaceString(startOffset, endOffset, request.content ?: "")
                })
            }
        } catch (e: Exception) {
            LOG.warn("[Cline] replaceText error (non-fatal): ${e.message}")
        }
        return ReplaceTextResponse.getDefaultInstance()
    }

    override suspend fun scrollDiff(request: ScrollDiffRequest): ScrollDiffResponse {
        val diffId = request.diffId?.takeIf { it.isNotEmpty() }
            ?: return ScrollDiffResponse.getDefaultInstance()
        val doc = diffDocuments[diffId] ?: return ScrollDiffResponse.getDefaultInstance()

        try {
            withContext(EdtDispatcher) {
                val editors: Array<Editor> = EditorFactory.getInstance().getEditors(doc, project)
                val targetLine = request.line.coerceAtLeast(0)
                editors.firstOrNull()?.scrollingModel?.scrollTo(
                    LogicalPosition(targetLine, 0),
                    ScrollType.CENTER
                )
            }
        } catch (e: Exception) {
            LOG.warn("[Cline] scrollDiff error (non-fatal): ${e.message}")
        }
        return ScrollDiffResponse.getDefaultInstance()
    }

    override suspend fun truncateDocument(request: TruncateDocumentRequest): TruncateDocumentResponse {
        val diffId = request.diffId?.takeIf { it.isNotEmpty() }
            ?: return TruncateDocumentResponse.getDefaultInstance()
        val doc = diffDocuments[diffId] ?: return TruncateDocumentResponse.getDefaultInstance()

        try {
            withContext(EdtDispatcher) {
                WriteCommandAction.runWriteCommandAction(project, "Cline truncateDocument", null, Runnable {
                    val lineCount = doc.lineCount
                    if (lineCount == 0) return@Runnable
                    val endLine = request.endLine.coerceIn(0, lineCount - 1)
                    val truncateOffset = doc.getLineEndOffset(endLine)
                    if (truncateOffset < doc.textLength) {
                        doc.deleteString(truncateOffset, doc.textLength)
                    }
                })
            }
        } catch (e: Exception) {
            LOG.warn("[Cline] truncateDocument error (non-fatal): ${e.message}")
        }
        return TruncateDocumentResponse.getDefaultInstance()
    }

    override suspend fun saveDocument(request: SaveDocumentRequest): SaveDocumentResponse {
        val diffId = request.diffId?.takeIf { it.isNotEmpty() }
            ?: return SaveDocumentResponse.getDefaultInstance()
        val modifiedDoc = diffDocuments[diffId]

        try {
            withContext(EdtDispatcher) {
                val vFile = LocalFileSystem.getInstance().refreshAndFindFileByPath(diffId)
                if (vFile != null) {
                    val fileDoc = FileDocumentManager.getInstance().getDocument(vFile)
                    if (fileDoc != null) {
                        WriteCommandAction.runWriteCommandAction(project, "Cline saveDocument", null, Runnable {
                            // 에이전트가 수정한 내용을 실제 파일 문서에 반영.
                            if (modifiedDoc != null) fileDoc.setText(modifiedDoc.text)
                        })
                        ApplicationManager.getApplication().invokeAndWait {
                            FileDocumentManager.getInstance().saveDocument(fileDoc)
                        }
                        vFile.refresh(false, false)
                    }
                }
            }
        } catch (e: Exception) {
            LOG.warn("[Cline] saveDocument error (non-fatal): ${e.message}")
        }
        return SaveDocumentResponse.getDefaultInstance()
    }

    override suspend fun closeAllDiffs(request: CloseAllDiffsRequest): CloseAllDiffsResponse {
        try {
            withContext(EdtDispatcher) {
                val fdm = FileDocumentManager.getInstance()
                val toClose = diffDocuments.entries.filter { (_, doc) ->
                    try { !fdm.isDocumentUnsaved(doc) } catch (_: Exception) { true }
                }
                toClose.forEach { (diffId, doc) ->
                    try {
                        EditorFactory.getInstance().getEditors(doc, project)
                            .forEach { EditorFactory.getInstance().releaseEditor(it) }
                    } catch (_: Exception) { /* ignore */ }
                    diffDocuments.remove(diffId)
                }
            }
        } catch (e: Exception) {
            LOG.warn("[Cline] closeAllDiffs error (non-fatal): ${e.message}")
        }
        return CloseAllDiffsResponse.getDefaultInstance()
    }

    override suspend fun openMultiFileDiff(request: OpenMultiFileDiffRequest): OpenMultiFileDiffResponse {
        try {
            withContext(EdtDispatcher) {
                val diffRequests = request.diffsList.mapNotNull { diff ->
                    val filePath = diff.filePath?.takeIf { it.isNotEmpty() } ?: return@mapNotNull null
                    val leftDoc = EditorFactory.getInstance().createDocument(diff.leftContent ?: "")
                    val rightDoc = EditorFactory.getInstance().createDocument(diff.rightContent ?: "")
                    diffDocuments[filePath] = rightDoc

                    SimpleDiffRequest(
                        filePath,
                        DocumentContentImpl(project, leftDoc, null),
                        DocumentContentImpl(project, rightDoc, null),
                        "원본",
                        "수정됨 (에이전트)"
                    )
                }

                // 각 파일 diff를 순서대로 표시; IntelliJ는 DiffManagerEx의 체인 API로 탐색.
                diffRequests.forEach { req ->
                    DiffManager.getInstance().showDiff(project, req)
                }
            }
        } catch (e: Exception) {
            LOG.warn("[Cline] openMultiFileDiff error (non-fatal): ${e.message}")
        }
        return OpenMultiFileDiffResponse.getDefaultInstance()
    }
}
