package bot.cline.ide

import com.intellij.ide.plugins.PluginManagerCore
import com.intellij.openapi.application.ApplicationManager
import com.intellij.openapi.diagnostic.Logger
import com.intellij.openapi.extensions.PluginId
import com.intellij.openapi.project.DumbAware
import com.intellij.openapi.project.Project
import com.intellij.openapi.wm.ToolWindow
import com.intellij.openapi.wm.ToolWindowFactory
import com.intellij.ui.content.ContentFactory
import com.intellij.ui.jcef.JBCefApp
import com.intellij.ui.jcef.JBCefBrowser
import com.intellij.ui.jcef.JBCefJSQuery
import org.cef.browser.CefBrowser
import org.cef.browser.CefFrame
import org.cef.handler.CefDisplayHandlerAdapter
import org.cef.handler.CefLoadHandlerAdapter
import org.cef.network.CefRequest
import com.sun.net.httpserver.HttpServer
import java.awt.BorderLayout
import java.io.File
import java.net.HttpURLConnection
import java.net.InetSocketAddress
import java.net.ServerSocket
import java.net.Socket
import java.net.URL
import java.util.concurrent.Executors
import javax.swing.JLabel
import javax.swing.JPanel
import javax.swing.SwingConstants

class ClineToolWindowFactory : ToolWindowFactory, DumbAware {

    companion object {
        private val LOG = Logger.getInstance(ClineToolWindowFactory::class.java)
        @Volatile private var webviewServerPort: Int = -1

        @Synchronized
        fun ensureWebviewHttpServer(baseDir: File): Int {
            if (webviewServerPort > 0) return webviewServerPort
            val port = ServerSocket(0).use { it.localPort }
            val server = HttpServer.create(InetSocketAddress("127.0.0.1", port), 20)
            val ext2ct = mapOf(
                "html" to "text/html; charset=utf-8",
                "js"   to "application/javascript",
                "css"  to "text/css",
                "woff2" to "font/woff2",
                "woff"  to "font/woff",
                "ttf"   to "font/ttf",
                "png"   to "image/png",
                "svg"   to "image/svg+xml",
            )
            server.createContext("/") { ex ->
                val rel = ex.requestURI.path.trimStart('/').ifEmpty { "index.html" }
                val file = File(baseDir, rel).canonicalFile
                val safe = file.canonicalPath.startsWith(baseDir.canonicalPath)
                val bytes = if (safe && file.isFile) file.readBytes()
                            else File(baseDir, "index.html").readBytes()
                val ct = ext2ct[file.extension] ?: "application/octet-stream"
                ex.responseHeaders.set("Content-Type", ct)
                ex.sendResponseHeaders(200, bytes.size.toLong())
                ex.responseBody.use { it.write(bytes) }
            }
            server.executor = Executors.newCachedThreadPool()
            server.start()
            webviewServerPort = port
            LOG.info("Webview HTTP server started at http://127.0.0.1:$port (serving ${baseDir.absolutePath})")
            return port
        }
    }

    private fun waitForPort(port: Int, maxWaitMs: Long = 20_000) {
        val deadline = System.currentTimeMillis() + maxWaitMs
        while (System.currentTimeMillis() < deadline) {
            try {
                Socket("127.0.0.1", port).use { return }
            } catch (_: Exception) {
                Thread.sleep(300)
            }
        }
        LOG.warn("Timed out waiting for port $port — forcing webview load")
    }

    private fun isDevServerRunning(url: String): Boolean = try {
        val conn = URL(url).openConnection() as HttpURLConnection
        conn.connectTimeout = 500
        conn.readTimeout = 500
        conn.requestMethod = "HEAD"
        conn.responseCode in 200..399
    } catch (_: Exception) {
        false
    }

    private fun resolveWebviewUrl(): String {
        System.getenv("CLINE_WEBVIEW_URL")?.let { return it }

        val devUrl = "http://localhost:25463"
        if (isDevServerRunning(devUrl)) return devUrl

        val pluginDir = PluginManagerCore.getPlugin(PluginId.getId("bot.cline.ide"))?.pluginPath?.toFile()
        if (pluginDir != null) {
            val bundled = File(pluginDir, "webview/index.html")
            if (bundled.exists()) {
                val port = ensureWebviewHttpServer(bundled.parentFile)
                return "http://127.0.0.1:$port"
            }

            var dir: File? = pluginDir.parentFile
            repeat(8) {
                if (dir == null) return@repeat
                val candidate = File(dir, "webview-ui/build/index.html")
                if (candidate.exists()) {
                    LOG.info("Found webview build at: ${candidate.absolutePath}")
                    val port = ensureWebviewHttpServer(candidate.parentFile)
                    return "http://127.0.0.1:$port"
                }
                dir = dir?.parentFile
            }
        }

        LOG.warn("Webview assets not found. Set CLINE_WEBVIEW_URL or run 'npm run build:jetbrains'.")
        return devUrl
    }

    override fun createToolWindowContent(project: Project, toolWindow: ToolWindow) {
        val panel = JPanel(BorderLayout())

        if (!JBCefApp.isSupported()) {
            val label = JLabel(
                "<html><center>" +
                "<p><b>JCEF (Chromium) is not available</b></p>" +
                "<p>Cline requires a JetBrains Runtime with JCEF support.</p>" +
                "<p>Go to <b>Help → Find Action → Choose Boot Java Runtime</b><br>" +
                "and select a runtime that includes JCEF.</p>" +
                "</center></html>",
                SwingConstants.CENTER
            )
            panel.add(label, BorderLayout.CENTER)
        } else {
            val browser = JBCefBrowser()

            val query = JBCefJSQuery.create(browser)
            query.addHandler { request ->
                LOG.debug("Webview message received: $request")
                JBCefJSQuery.Response("success")
            }

            // Forward JCEF JavaScript console messages to IntelliJ log for debugging
            browser.jbCefClient.addDisplayHandler(object : CefDisplayHandlerAdapter() {
                override fun onConsoleMessage(
                    cefBrowser: CefBrowser?,
                    level: org.cef.CefSettings.LogSeverity?,
                    message: String?,
                    source: String?,
                    line: Int
                ): Boolean {
                    LOG.info("[JCEF-console] $message (${source}:$line)")
                    return false
                }
            }, browser.cefBrowser)

            browser.jbCefClient.addLoadHandler(object : CefLoadHandlerAdapter() {
                override fun onLoadStart(cefBrowser: CefBrowser?, frame: CefFrame?, transitionType: CefRequest.TransitionType?) {
                    val injectJs = """
                        window.standalonePostMessage = function(msg) {
                            ${query.inject("JSON.stringify(msg)")}
                        };
                    """.trimIndent()
                    frame?.executeJavaScript(injectJs, frame.url, 0)
                }

                override fun onLoadEnd(cefBrowser: CefBrowser?, frame: CefFrame?, httpStatusCode: Int) {
                    val injectCss = """
                        (function() {
                            var s = document.documentElement.style;
                            s.setProperty('--vscode-editor-background', '#1E1E1E');
                            s.setProperty('--vscode-editor-foreground', '#D4D4D4');
                            s.setProperty('--vscode-foreground', '#CCCCCC');
                            s.setProperty('--vscode-descriptionForeground', '#ABABAB');
                            s.setProperty('--vscode-sideBar-background', '#252526');
                            s.setProperty('--vscode-sideBar-foreground', '#CCCCCC');
                            s.setProperty('--vscode-sideBar-border', '#3C3C3C');
                            s.setProperty('--vscode-input-background', '#3C3C3C');
                            s.setProperty('--vscode-input-foreground', '#CCCCCC');
                            s.setProperty('--vscode-input-border', '#3C3C3C');
                            s.setProperty('--vscode-input-placeholderForeground', '#A6A6A6');
                            s.setProperty('--vscode-inputValidation-errorBackground', '#5A1D1D');
                            s.setProperty('--vscode-inputValidation-errorForeground', '#F48771');
                            s.setProperty('--vscode-inputValidation-warningBackground', '#352A05');
                            s.setProperty('--vscode-inputValidation-warningForeground', '#CCA700');
                            s.setProperty('--vscode-dropdown-background', '#313131');
                            s.setProperty('--vscode-dropdown-foreground', '#CCCCCC');
                            s.setProperty('--vscode-dropdown-border', '#3C3C3C');
                            s.setProperty('--vscode-button-background', '#0E639C');
                            s.setProperty('--vscode-button-foreground', '#FFFFFF');
                            s.setProperty('--vscode-button-hoverBackground', '#1177BB');
                            s.setProperty('--vscode-button-separator', 'rgba(255,255,255,0.4)');
                            s.setProperty('--vscode-button-secondaryBackground', '#3A3D41');
                            s.setProperty('--vscode-button-secondaryForeground', '#FFFFFF');
                            s.setProperty('--vscode-button-secondaryHoverBackground', '#45494E');
                            s.setProperty('--vscode-focusBorder', '#007FD4');
                            s.setProperty('--vscode-panel-border', '#3C3C3C');
                            s.setProperty('--vscode-widget-shadow', '#000000');
                            s.setProperty('--vscode-editorGroup-border', '#444444');
                            s.setProperty('--vscode-editorWidget-border', '#454545');
                            s.setProperty('--vscode-list-activeSelectionBackground', '#04395E');
                            s.setProperty('--vscode-list-activeSelectionForeground', '#FFFFFF');
                            s.setProperty('--vscode-list-hoverBackground', '#2A2D2E');
                            s.setProperty('--vscode-editor-inactiveSelectionBackground', '#3A3D41');
                            s.setProperty('--vscode-quickInputList-focusForeground', '#FFFFFF');
                            s.setProperty('--vscode-quickInput-background', '#252526');
                            s.setProperty('--vscode-badge-background', '#4D4D4D');
                            s.setProperty('--vscode-badge-foreground', '#FFFFFF');
                            s.setProperty('--vscode-textLink-foreground', '#3794FF');
                            s.setProperty('--vscode-textLink-activeForeground', '#3794FF');
                            s.setProperty('--vscode-textCodeBlock-background', '#2A2D2E');
                            s.setProperty('--vscode-textBlockQuote-background', '#2A2D2E');
                            s.setProperty('--vscode-textBlockQuote-foreground', '#D4D4D4');
                            s.setProperty('--vscode-textPreformat-foreground', '#CE9178');
                            s.setProperty('--vscode-textSeparator-foreground', '#424242');
                            s.setProperty('--vscode-diffEditor-insertedTextBackground', 'rgba(155, 185, 85, 0.2)');
                            s.setProperty('--vscode-diffEditor-removedTextBackground', 'rgba(255, 0, 0, 0.2)');
                            s.setProperty('--vscode-diffEditor-insertedLineBackground', 'rgba(155, 185, 85, 0.15)');
                            s.setProperty('--vscode-diffEditor-removedLineBackground', 'rgba(255, 0, 0, 0.15)');
                            s.setProperty('--vscode-toolbar-background', 'transparent');
                            s.setProperty('--vscode-toolbar-hoverBackground', '#5A5D5E50');
                            s.setProperty('--vscode-font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif');
                            s.setProperty('--vscode-font-size', '13px');
                            s.setProperty('--vscode-editor-font-family', '"JetBrains Mono", Menlo, Monaco, "Courier New", monospace');
                            s.setProperty('--vscode-editor-font-size', '13px');
                            s.setProperty('--vscode-errorForeground', '#F48771');
                            s.setProperty('--vscode-problemsErrorIcon-foreground', '#F48771');
                            s.setProperty('--vscode-editorWarning-foreground', '#CCA700');
                            s.setProperty('--vscode-notificationsInfoIcon-foreground', '#3794FF');
                            s.setProperty('--vscode-editor-findMatchHighlightBackground', '#EA5C0055');
                            s.setProperty('--vscode-icon-foreground', '#C5C5C5');
                            s.setProperty('--vscode-editor-foldPlaceholderForeground', '#ABABAB');
                            s.setProperty('--vscode-editor-border', '#3C3C3C');
                            s.setProperty('--vscode-charts-green', '#89D185');
                            s.setProperty('--vscode-charts-yellow', '#CCA700');
                            s.setProperty('--vscode-testing-iconFailed', '#F48771');
                            s.setProperty('--vscode-banner-background', '#04395E');
                            s.setProperty('--vscode-banner-foreground', '#FFFFFF');
                            s.setProperty('--vscode-banner-iconForeground', '#3794FF');
                            s.setProperty('--vscode-menu-background', '#3C3C3C');
                            s.setProperty('--vscode-menu-foreground', '#CCCCCC');
                            s.setProperty('--vscode-menu-border', '#454545');
                            s.setProperty('--vscode-menu-shadow', '#000000');
                            s.setProperty('--vscode-titleBar-inactiveForeground', '#ABABAB');
                            s.setProperty('--design-unit', '4');
                            document.body.classList.add('dark');
                        })();
                    """.trimIndent()
                    frame?.executeJavaScript(injectCss, frame.url, 0)
                }
            }, browser.cefBrowser)

            panel.add(browser.component, BorderLayout.CENTER)

            ApplicationManager.getApplication().executeOnPooledThread {
                // Wait for ClineProjectActivity to allocate the port (max 30s)
                val latchOk = ClineProjectActivity.ready.await(30, java.util.concurrent.TimeUnit.SECONDS)
                if (!latchOk) {
                    LOG.warn("Timed out waiting for ClineProjectActivity to initialize — loading webview anyway")
                }

                val url = resolveWebviewUrl()
                val wsPort = ClineProjectActivity.websocketPort
                if (wsPort > 1) {  // protobusPort=0 → wsPort=1 means not initialized
                    waitForPort(wsPort)
                }
                ApplicationManager.getApplication().invokeLater {
                    browser.loadURL(url)
                }
            }
        }

        val contentFactory = ContentFactory.getInstance()
        val content = contentFactory.createContent(panel, "", false)
        toolWindow.contentManager.addContent(content)
    }

    override fun isApplicable(project: Project): Boolean = !project.isDefault
}
