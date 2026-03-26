package bot.cline.ide

import com.intellij.openapi.application.ApplicationManager
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.Runnable
import kotlin.coroutines.CoroutineContext

/**
 * IntelliJ EDT 디스패처.
 * Dispatchers.Main은 IntelliJ 환경에서 초기화 실패할 수 있으므로,
 * ApplicationManager.invokeLater를 사용하여 EDT에서 안전하게 실행.
 */
object EdtDispatcher : CoroutineDispatcher() {
    override fun dispatch(context: CoroutineContext, block: Runnable) {
        val app = ApplicationManager.getApplication()
        if (app != null && !app.isDisposed) {
            app.invokeLater(block)
        } else {
            block.run()
        }
    }
}
