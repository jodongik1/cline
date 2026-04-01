package bot.cline.ide.grpc

import bot.cline.host.proto.*
import com.intellij.openapi.diagnostic.Logger
import com.intellij.openapi.project.Project
import com.intellij.openapi.ui.Messages
import com.intellij.openapi.fileEditor.FileEditorManager
import com.intellij.openapi.fileChooser.FileChooserDescriptorFactory
import com.intellij.openapi.fileChooser.FileChooser
import com.intellij.openapi.vfs.LocalFileSystem
import com.intellij.openapi.application.ApplicationManager
import bot.cline.ide.EdtDispatcher
import kotlinx.coroutines.withContext

class WindowServiceImpl(private val project: Project) : WindowServiceGrpcKt.WindowServiceCoroutineImplBase() {

    companion object {
        private val LOG = Logger.getInstance(WindowServiceImpl::class.java)
    }

    override suspend fun showTextDocument(request: ShowTextDocumentRequest): TextEditorInfo {
        var viewColumn = 0
        var isActive = false
        val path = request.path

        try {
            withContext(EdtDispatcher) {
                val virtualFile = LocalFileSystem.getInstance().findFileByPath(path)
                if (virtualFile != null) {
                    FileEditorManager.getInstance(project).openFile(virtualFile, true)
                    isActive = true
                }
            }
        } catch (e: Exception) {
            LOG.warn("[Cline] showTextDocument error (non-fatal): ${e.message}")
        }
        return TextEditorInfo.newBuilder().setDocumentPath(path).setIsActive(isActive).setViewColumn(viewColumn).build()
    }

    override suspend fun showMessage(request: ShowMessageRequest): SelectedResponse {
        var selectedItem = ""
        withContext(EdtDispatcher) {
            val title = "Cline"
            val message = request.message
            val options = request.options.itemsList.toTypedArray()
            val defaultOptionIndex = if (options.isNotEmpty()) 0 else -1

            when (request.type) {
                ShowMessageType.ERROR -> {
                    if (options.isNotEmpty()) {
                        val index = Messages.showDialog(project, message, title, options, defaultOptionIndex, Messages.getErrorIcon())
                        if (index >= 0) selectedItem = options[index]
                    } else {
                        Messages.showErrorDialog(project, message, title)
                    }
                }
                ShowMessageType.WARNING -> {
                    if (options.isNotEmpty()) {
                        val index = Messages.showDialog(project, message, title, options, defaultOptionIndex, Messages.getWarningIcon())
                        if (index >= 0) selectedItem = options[index]
                    } else {
                        Messages.showWarningDialog(project, message, title)
                    }
                }
                ShowMessageType.INFORMATION -> {
                    if (options.isNotEmpty()) {
                        val index = Messages.showDialog(project, message, title, options, defaultOptionIndex, Messages.getInformationIcon())
                        if (index >= 0) selectedItem = options[index]
                    } else {
                        Messages.showInfoMessage(project, message, title)
                    }
                }
                else -> Messages.showInfoMessage(project, message, title)
            }

        }
        return SelectedResponse.newBuilder().setSelectedOption(selectedItem).build()
    }

    override suspend fun showOpenDialogue(request: ShowOpenDialogueRequest): SelectedResources {
        val selectedPaths = mutableListOf<String>()
        withContext(EdtDispatcher) {
            val descriptor = if (request.canSelectMany) {
                FileChooserDescriptorFactory.createMultipleFilesNoJarsDescriptor()
            } else {
                FileChooserDescriptorFactory.createSingleFileDescriptor()
            }
            val files = FileChooser.chooseFiles(descriptor, project, null)
            selectedPaths.addAll(files.map { it.path })
        }
        return SelectedResources.newBuilder().addAllPaths(selectedPaths).build()
    }

    override suspend fun showSaveDialog(request: ShowSaveDialogRequest): ShowSaveDialogResponse {
        var selectedPath = ""
        withContext(EdtDispatcher) {
            val descriptor = FileChooserDescriptorFactory.createSingleFileDescriptor()
            val file = FileChooser.chooseFile(descriptor, project, null)
            if (file != null) {
                selectedPath = file.path
            }
        }
        return ShowSaveDialogResponse.newBuilder().setSelectedPath(selectedPath).build()
    }

    override suspend fun showInputBox(request: ShowInputBoxRequest): ShowInputBoxResponse {
        var result = ""
        withContext(EdtDispatcher) {
            result = Messages.showInputDialog(project, request.prompt, request.title, Messages.getQuestionIcon(), request.value, null).orEmpty()
        }
        return ShowInputBoxResponse.newBuilder().setResponse(result).build()
    }

    override suspend fun openFile(request: OpenFileRequest): OpenFileResponse {
        try {
            withContext(EdtDispatcher) {
                val virtualFile = LocalFileSystem.getInstance().findFileByPath(request.filePath)
                if (virtualFile != null) {
                    FileEditorManager.getInstance(project).openFile(virtualFile, true)
                }
            }
        } catch (e: Exception) {
            LOG.warn("[Cline] openFile error (non-fatal): ${e.message}")
        }
        return OpenFileResponse.getDefaultInstance()
    }

    override suspend fun openSettings(request: OpenSettingsRequest): OpenSettingsResponse {
        withContext(EdtDispatcher) {
            com.intellij.openapi.options.ShowSettingsUtil.getInstance().showSettingsDialog(project, request.query)
        }
        return OpenSettingsResponse.getDefaultInstance()
    }

    override suspend fun getActiveEditor(request: GetActiveEditorRequest): GetActiveEditorResponse {
        var currentPath = ""
        try {
            withContext(EdtDispatcher) {
                val file = FileEditorManager.getInstance(project).selectedFiles.firstOrNull()
                if (file != null) {
                    currentPath = file.path
                }
            }
        } catch (e: Exception) {
            LOG.warn("[Cline] getActiveEditor error (non-fatal): ${e.message}")
        }
        return GetActiveEditorResponse.newBuilder().setFilePath(currentPath).build()
    }

    override suspend fun getOpenTabs(request: GetOpenTabsRequest): GetOpenTabsResponse {
        val paths = mutableListOf<String>()
        try {
            withContext(EdtDispatcher) {
                paths.addAll(FileEditorManager.getInstance(project).openFiles.map { it.path })
            }
        } catch (e: Exception) {
            LOG.warn("[Cline] getOpenTabs error (non-fatal): ${e.message}")
        }
        return GetOpenTabsResponse.newBuilder().addAllPaths(paths).build()
    }

    override suspend fun getVisibleTabs(request: GetVisibleTabsRequest): GetVisibleTabsResponse {
        val paths = mutableListOf<String>()
        try {
            withContext(EdtDispatcher) {
                paths.addAll(FileEditorManager.getInstance(project).selectedFiles.map { it.path })
            }
        } catch (e: Exception) {
            LOG.warn("[Cline] getVisibleTabs error (non-fatal): ${e.message}")
        }
        return GetVisibleTabsResponse.newBuilder().addAllPaths(paths).build()
    }
}
