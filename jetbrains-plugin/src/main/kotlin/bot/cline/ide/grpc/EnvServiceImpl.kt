package bot.cline.ide.grpc

import bot.cline.host.proto.*
import com.intellij.openapi.diagnostic.Logger
import com.intellij.openapi.application.ApplicationInfo
import com.intellij.openapi.ide.CopyPasteManager
import java.awt.datatransfer.StringSelection
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.emptyFlow

class EnvServiceImpl : EnvServiceGrpcKt.EnvServiceCoroutineImplBase() {

    companion object {
        private val LOG = Logger.getInstance(EnvServiceImpl::class.java)
    }

    override suspend fun clipboardWriteText(request: bot.cline.proto.StringRequest): bot.cline.proto.Empty {
        CopyPasteManager.getInstance().setContents(StringSelection(request.value))
        return bot.cline.proto.Empty.getDefaultInstance()
    }

    override suspend fun clipboardReadText(request: bot.cline.proto.EmptyRequest): bot.cline.proto.String {
        val contents = CopyPasteManager.getInstance().contents
        val text = contents?.transferDataFlavors?.firstOrNull { it.isFlavorTextType }?.let { flavor ->
            contents.getTransferData(flavor) as? String
        } ?: ""

        return bot.cline.proto.String.newBuilder().setValue(text).build()
    }

    override suspend fun getHostVersion(request: bot.cline.proto.EmptyRequest): GetHostVersionResponse {
        val appInfo = ApplicationInfo.getInstance()
        return GetHostVersionResponse.newBuilder()
            .setPlatform(appInfo.fullApplicationName)
            .setVersion(appInfo.fullVersion)
            .setClineType("Cline for JetBrains")
            .setClineVersion("1.0.0") // 또는 플러그인 디스크립터에서 읽어옴
            .setRemoteName("")
            .build()
    }

    override suspend fun getIdeRedirectUri(request: bot.cline.proto.EmptyRequest): bot.cline.proto.String {
        return bot.cline.proto.String.newBuilder().setValue("idea://").build()
    }

    override suspend fun getTelemetrySettings(request: bot.cline.proto.EmptyRequest): GetTelemetrySettingsResponse {
        return GetTelemetrySettingsResponse.newBuilder()
            .setIsEnabled(Setting.UNSUPPORTED)
            .build()
    }

    override fun subscribeToTelemetrySettings(request: bot.cline.proto.EmptyRequest): Flow<TelemetrySettingsEvent> {
        return emptyFlow()
    }

    override suspend fun shutdown(request: bot.cline.proto.EmptyRequest): bot.cline.proto.Empty {
        // 코어에서 종료 요청 시 처리
        return bot.cline.proto.Empty.getDefaultInstance()
    }

    override suspend fun debugLog(request: bot.cline.proto.StringRequest): bot.cline.proto.Empty {
        LOG.debug("[cline-core] ${request.value}")
        return bot.cline.proto.Empty.getDefaultInstance()
    }

    override suspend fun openExternal(request: bot.cline.proto.StringRequest): bot.cline.proto.Empty {
        com.intellij.ide.BrowserUtil.browse(request.value)
        return bot.cline.proto.Empty.getDefaultInstance()
    }
}
