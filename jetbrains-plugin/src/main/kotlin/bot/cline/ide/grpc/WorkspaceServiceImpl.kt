package bot.cline.ide.grpc

import bot.cline.host.proto.*
import com.intellij.openapi.diagnostic.Logger
import bot.cline.proto.Diagnostic
import bot.cline.proto.DiagnosticPosition
import bot.cline.proto.DiagnosticRange
import bot.cline.proto.DiagnosticSeverity
import bot.cline.proto.FileDiagnostics
import com.intellij.codeInsight.daemon.impl.DaemonCodeAnalyzerImpl
import com.intellij.ide.impl.ProjectUtil
import com.intellij.ide.projectView.ProjectView
import com.intellij.lang.annotation.HighlightSeverity
import com.intellij.openapi.application.ApplicationManager
import com.intellij.openapi.application.WriteAction
import com.intellij.openapi.fileEditor.FileDocumentManager
import com.intellij.openapi.fileEditor.FileEditorManager
import com.intellij.openapi.project.Project
import com.intellij.openapi.roots.ProjectRootManager
import com.intellij.openapi.util.Computable
import com.intellij.openapi.vfs.LocalFileSystem
import com.intellij.openapi.wm.ToolWindowManager
import com.intellij.psi.PsiManager
import bot.cline.ide.EdtDispatcher
import kotlinx.coroutines.withContext
import org.jetbrains.plugins.terminal.TerminalToolWindowManager
import java.nio.file.Paths

class WorkspaceServiceImpl(private val project: Project) : WorkspaceServiceGrpcKt.WorkspaceServiceCoroutineImplBase() {

    companion object {
        private val LOG = Logger.getInstance(WorkspaceServiceImpl::class.java)
    }

    override suspend fun getWorkspacePaths(request: GetWorkspacePathsRequest): GetWorkspacePathsResponse {
        var paths = ProjectRootManager.getInstance(project).contentRoots.map { it.path }
        // contentRoots가 비어있으면 project.basePath를 fallback으로 사용
        if (paths.isEmpty()) {
            val basePath = project.basePath
            if (!basePath.isNullOrEmpty()) {
                paths = listOf(basePath)
            }
        }
        LOG.info("[Cline] getWorkspacePaths: ${paths.joinToString(", ")}")
        return GetWorkspacePathsResponse.newBuilder()
            .setId(project.locationHash)
            .addAllPaths(paths)
            .build()
    }

    override suspend fun saveOpenDocumentIfDirty(request: SaveOpenDocumentIfDirtyRequest): SaveOpenDocumentIfDirtyResponse {
        val filePath = request.filePath
        if (filePath.isEmpty()) {
            return SaveOpenDocumentIfDirtyResponse.newBuilder().setWasSaved(false).build()
        }

        var wasSaved = false
        try {
            withContext(EdtDispatcher) {
                val virtualFile = LocalFileSystem.getInstance().findFileByPath(filePath)
                if (virtualFile != null) {
                    val document = FileDocumentManager.getInstance().getDocument(virtualFile)
                    if (document != null && FileDocumentManager.getInstance().isDocumentUnsaved(document)) {
                        WriteAction.run<Exception> {
                            FileDocumentManager.getInstance().saveDocument(document)
                        }
                        wasSaved = true
                    }
                }
            }
        } catch (e: Exception) {
            LOG.info("[Cline] saveOpenDocumentIfDirty error (non-fatal): ${e.message}")
        }
        return SaveOpenDocumentIfDirtyResponse.newBuilder().setWasSaved(wasSaved).build()
    }

    override suspend fun executeCommandInTerminal(request: ExecuteCommandInTerminalRequest): ExecuteCommandInTerminalResponse {
        return try {
            withContext(EdtDispatcher) {
                val workDir = project.basePath
                val terminalManager = TerminalToolWindowManager.getInstance(project)
                // 프로젝트 루트 디렉터리에 "Cline" 이름으로 새 터미널 탭 열기.
                val widget = terminalManager.createLocalShellWidget(workDir, "Cline")
                widget.executeCommand(request.command)
                // 터미널 툴 윈도우가 보이도록 표시.
                ToolWindowManager.getInstance(project).getToolWindow("Terminal")?.show()
            }
            ExecuteCommandInTerminalResponse.newBuilder().setSuccess(true).build()
        } catch (e: Exception) {
            LOG.error("[Cline] executeCommandInTerminal 실패: ${e.message}")
            ExecuteCommandInTerminalResponse.newBuilder().setSuccess(false).build()
        }
    }

    override suspend fun getDiagnostics(request: GetDiagnosticsRequest): GetDiagnosticsResponse {
        val fileDiagnosticsList = mutableListOf<FileDiagnostics>()

        try {
            withContext(EdtDispatcher) {
                val openFiles = FileEditorManager.getInstance(project).openFiles
                for (vFile in openFiles) {
                    try {
                        val document = ApplicationManager.getApplication().runReadAction(Computable {
                            FileDocumentManager.getInstance().getDocument(vFile)
                        }) ?: continue

                        val highlights = ApplicationManager.getApplication().runReadAction(Computable {
                            DaemonCodeAnalyzerImpl.getHighlights(document, HighlightSeverity.WARNING, project)
                        }) ?: continue

                        if (highlights.isEmpty()) continue

                        val diagnostics = highlights.map { info ->
                            val startOffset = info.startOffset.coerceIn(0, document.textLength)
                            val endOffset = info.endOffset.coerceIn(startOffset, document.textLength)
                            val startLine = document.getLineNumber(startOffset)
                            val endLine = document.getLineNumber(endOffset)
                            val startChar = startOffset - document.getLineStartOffset(startLine)
                            val endChar = endOffset - document.getLineStartOffset(endLine)

                            val severity = when {
                                info.severity == HighlightSeverity.ERROR -> DiagnosticSeverity.DIAGNOSTIC_ERROR
                                info.severity == HighlightSeverity.WARNING -> DiagnosticSeverity.DIAGNOSTIC_WARNING
                                info.severity == HighlightSeverity.INFORMATION -> DiagnosticSeverity.DIAGNOSTIC_INFORMATION
                                else -> DiagnosticSeverity.DIAGNOSTIC_HINT
                            }

                            Diagnostic.newBuilder()
                                .setMessage(info.description ?: "")
                                .setRange(
                                    DiagnosticRange.newBuilder()
                                        .setStart(DiagnosticPosition.newBuilder().setLine(startLine).setCharacter(startChar))
                                        .setEnd(DiagnosticPosition.newBuilder().setLine(endLine).setCharacter(endChar))
                                )
                                .setSeverity(severity)
                                .also { b -> info.toolTip?.let { b.setSource(it) } }
                                .build()
                        }

                        fileDiagnosticsList.add(
                            FileDiagnostics.newBuilder()
                                .setFilePath(vFile.path)
                                .addAllDiagnostics(diagnostics)
                                .build()
                        )
                    } catch (e: Exception) {
                        LOG.info("[Cline] getDiagnostics: skipping file ${vFile.path}: ${e.message}")
                    }
                }
            }
        } catch (e: Exception) {
            LOG.info("[Cline] getDiagnostics error (non-fatal): ${e.message}")
        }

        return GetDiagnosticsResponse.newBuilder()
            .addAllFileDiagnostics(fileDiagnosticsList)
            .build()
    }

    override suspend fun openProblemsPanel(request: OpenProblemsPanelRequest): OpenProblemsPanelResponse {
        withContext(EdtDispatcher) {
            ToolWindowManager.getInstance(project).getToolWindow("Problems")?.show()
        }
        return OpenProblemsPanelResponse.getDefaultInstance()
    }

    override suspend fun openInFileExplorerPanel(request: OpenInFileExplorerPanelRequest): OpenInFileExplorerPanelResponse {
        withContext(EdtDispatcher) {
            val toolWindow = ToolWindowManager.getInstance(project).getToolWindow("Project")
            toolWindow?.show()

            // 경로가 주어진 경우 프로젝트 뷰 트리에서 해당 항목 선택.
            val path = request.path.takeIf { it.isNotEmpty() } ?: return@withContext
            val vFile = LocalFileSystem.getInstance().findFileByPath(path) ?: return@withContext
            val psiElement = ApplicationManager.getApplication().runReadAction(Computable {
                PsiManager.getInstance(project).findFile(vFile)
                    ?: PsiManager.getInstance(project).findDirectory(vFile)
            })
            ProjectView.getInstance(project).select(psiElement, vFile, true)
        }
        return OpenInFileExplorerPanelResponse.getDefaultInstance()
    }

    override suspend fun openClineSidebarPanel(request: OpenClineSidebarPanelRequest): OpenClineSidebarPanelResponse {
        withContext(EdtDispatcher) {
            ToolWindowManager.getInstance(project).getToolWindow("Cline")?.show()
        }
        return OpenClineSidebarPanelResponse.getDefaultInstance()
    }

    override suspend fun openTerminalPanel(request: OpenTerminalRequest): OpenTerminalResponse {
        withContext(EdtDispatcher) {
            ToolWindowManager.getInstance(project).getToolWindow("Terminal")?.show()
        }
        return OpenTerminalResponse.getDefaultInstance()
    }

    override suspend fun openFolder(request: OpenFolderRequest): OpenFolderResponse {
        return try {
            val path = request.path.takeIf { it.isNotEmpty() }
                ?: return OpenFolderResponse.newBuilder().setSuccess(false).build()

            withContext(EdtDispatcher) {
                ProjectUtil.openOrImport(Paths.get(path), if (request.newWindow) null else project, request.newWindow)
            }
            OpenFolderResponse.newBuilder().setSuccess(true).build()
        } catch (e: Exception) {
            LOG.error("[Cline] openFolder 실패: ${e.message}")
            OpenFolderResponse.newBuilder().setSuccess(false).build()
        }
    }
}
