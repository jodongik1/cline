package bot.cline.ide

import bot.cline.ide.grpc.*
import com.intellij.ide.plugins.PluginManagerCore
import com.intellij.notification.NotificationGroupManager
import com.intellij.notification.NotificationType
import com.intellij.openapi.diagnostic.Logger
import com.intellij.openapi.extensions.PluginId
import com.intellij.openapi.project.Project
import com.intellij.openapi.startup.ProjectActivity
import io.grpc.ServerBuilder
import io.grpc.health.v1.HealthCheckResponse
import io.grpc.protobuf.services.HealthStatusManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.BufferedReader
import java.io.File
import java.io.InputStreamReader
import java.net.ServerSocket

class ClineProjectActivity : ProjectActivity {

    companion object {
        private val LOG = Logger.getInstance(ClineProjectActivity::class.java)

        /** Allocated ProtoBus port for the current session (0 = not yet allocated). */
        @Volatile
        var protobusPort: Int = 0
            private set

        /** WebSocket port is always ProtoBus + 1. */
        val websocketPort: Int get() = protobusPort + 1

        /** Latch that signals when cline-core is ready (port is set). */
        val ready = java.util.concurrent.CountDownLatch(1)

        /** Reference to the cline-core process for cleanup on shutdown. */
        @Volatile
        var coreProcess: Process? = null
            private set
    }

    /**
     * Resolves the full path to the `node` binary.
     * IntelliJ JVM process may not inherit shell PATH (especially with nvm),
     * so we probe known locations before falling back to the bare `node` command.
     */
    private fun resolveNodePath(): String {
        System.getenv("CLINE_NODE_PATH")?.takeIf { File(it).exists() }?.let { return it }

        try {
            val shell = System.getenv("SHELL") ?: "/bin/bash"
            val which = ProcessBuilder(shell, "-l", "-c", "which node")
                .redirectErrorStream(true)
                .start()
            val path = which.inputStream.bufferedReader().readLine()?.trim()
            if (!path.isNullOrBlank() && File(path).exists()) return path
        } catch (_: Exception) { /* continue */ }

        val home = System.getProperty("user.home") ?: ""
        val nvmDir = File(home, ".nvm/versions/node")
        if (nvmDir.isDirectory) {
            val nodeBin = nvmDir.listFiles()
                ?.filter { it.isDirectory }
                ?.sortedDescending()
                ?.mapNotNull { File(it, "bin/node").takeIf { f -> f.exists() } }
                ?.firstOrNull()
            if (nodeBin != null) return nodeBin.absolutePath
        }

        for (candidate in listOf("/opt/homebrew/bin/node", "/usr/local/bin/node", "/usr/bin/node")) {
            if (File(candidate).exists()) return candidate
        }

        return "node"
    }

    private fun resolveCoreScriptPath(): String? {
        System.getenv("CLINE_CORE_PATH")?.takeIf { File(it).exists() }?.let {
            LOG.info("cline-core.js found via CLINE_CORE_PATH: $it")
            return it
        }

        val pluginDescriptor = PluginManagerCore.getPlugin(PluginId.getId("bot.cline.ide"))
        val pluginDir = pluginDescriptor?.pluginPath?.toFile()
        LOG.info("Plugin descriptor: $pluginDescriptor, pluginDir: ${pluginDir?.absolutePath}")

        if (pluginDir != null) {
            // Log directory contents for debugging
            LOG.info("pluginDir contents: ${pluginDir.listFiles()?.map { it.name }}")

            // Direct path: pluginDir/dist-standalone/cline-core.js
            val bundled = File(pluginDir, "dist-standalone/cline-core.js")
            if (bundled.exists()) {
                LOG.info("cline-core.js found at: ${bundled.absolutePath}")
                return bundled.absolutePath
            }

            // Check inside lib/ directory (some plugin layouts nest differently)
            val libDir = File(pluginDir, "lib")
            if (libDir.isDirectory) {
                LOG.info("lib/ contents: ${libDir.listFiles()?.map { it.name }}")
            }

            // Walk up directory tree for sandbox dev layout or source tree
            var dir: File? = pluginDir.parentFile
            repeat(8) {
                if (dir == null) return@repeat
                val candidate = File(dir, "dist-standalone/cline-core.js")
                if (candidate.exists()) {
                    LOG.info("cline-core.js found (parent walk): ${candidate.absolutePath}")
                    return candidate.absolutePath
                }
                dir = dir?.parentFile
            }

            LOG.warn("cline-core.js NOT found. Searched: ${bundled.absolutePath} and parent dirs up to ${pluginDir.absolutePath}")
        } else {
            LOG.warn("Could not resolve plugin directory for bot.cline.ide")
        }

        return null
    }

    /**
     * Terminates processes occupying the specified port.
     * Uses lsof on macOS/Linux and netstat on Windows.
     */
    private fun killProcessOnPort(port: Int) {
        try {
            val os = System.getProperty("os.name").lowercase()
            if (os.contains("win")) {
                val result = ProcessBuilder("cmd", "/c", "netstat -ano | findstr :$port")
                    .redirectErrorStream(true).start()
                    .inputStream.bufferedReader().readText().trim()
                val pids = result.lines()
                    .mapNotNull { it.trim().split("\\s+".toRegex()).lastOrNull() }
                    .filter { it.all(Char::isDigit) && it != "0" }
                    .toSet()
                pids.forEach { pid ->
                    LOG.info("Killing process on port $port (PID: $pid)")
                    ProcessBuilder("taskkill", "/F", "/PID", pid).start().waitFor()
                }
            } else {
                val result = ProcessBuilder("lsof", "-ti", ":$port")
                    .redirectErrorStream(true).start()
                    .inputStream.bufferedReader().readText().trim()
                if (result.isNotBlank()) {
                    result.lines().filter { it.isNotBlank() }.forEach { pid ->
                        LOG.info("Killing process on port $port (PID: $pid)")
                        ProcessBuilder("kill", pid).start().waitFor()
                    }
                    Thread.sleep(500)
                }
            }
        } catch (e: Exception) {
            LOG.warn("Failed to kill process on port $port: ${e.message}")
        }
    }

    /**
     * Ensures better-sqlite3 native module matches the user's Node.js ABI version.
     * Runs prebuild-install to download the correct prebuilt binary if needed.
     */
    private fun ensureNativeModules(nodePath: String, coreDir: File) {
        val betterSqliteDir = File(coreDir, "node_modules/better-sqlite3")
        if (!betterSqliteDir.isDirectory) {
            LOG.info("better-sqlite3 not found in bundle, skipping native module check")
            return
        }

        try {
            // Get current Node.js ABI version
            val abiProc = ProcessBuilder(nodePath, "-e", "process.stdout.write(process.versions.modules)")
                .redirectErrorStream(true).start()
            val runtimeAbi = abiProc.inputStream.bufferedReader().readText().trim()
            abiProc.waitFor()
            LOG.info("Runtime Node.js ABI version: $runtimeAbi")

            // Check if existing .node binary matches
            val nodeFile = File(betterSqliteDir, "build/Release/better_sqlite3.node")
            if (nodeFile.exists()) {
                val checkScript = "try{require('${nodeFile.absolutePath.replace("\\","/")}');process.stdout.write('OK')}catch(e){process.stdout.write('MISMATCH')}"
                val checkProc = ProcessBuilder(nodePath, "-e", checkScript)
                    .redirectErrorStream(true).start()
                val checkResult = checkProc.inputStream.bufferedReader().readText().trim()
                checkProc.waitFor()

                if (checkResult == "OK") {
                    LOG.info("better-sqlite3 native module ABI matches, no rebuild needed")
                    return
                }
                LOG.info("better-sqlite3 ABI mismatch detected, downloading matching prebuilt...")
            } else {
                LOG.info("better-sqlite3 native binary not found, downloading prebuilt...")
            }

            // npx/npm use "#!/usr/bin/env node" shebang — need node's bin dir in PATH
            val nodeBinDir = File(nodePath).parent
            val envWithNode = mapOf("PATH" to "$nodeBinDir:/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin")

            // Run prebuild-install to download the correct prebuilt binary
            val npxPath = File(nodeBinDir, "npx").absolutePath
            val prebuildProc = ProcessBuilder(
                npxPath, "prebuild-install", "--runtime", "napi", "--target", runtimeAbi
            )
            prebuildProc.directory(betterSqliteDir)
            prebuildProc.environment().putAll(envWithNode)
            prebuildProc.redirectErrorStream(true)
            val process = prebuildProc.start()
            val output = process.inputStream.bufferedReader().readText()
            val exitCode = process.waitFor()

            if (exitCode == 0) {
                LOG.info("prebuild-install succeeded for ABI $runtimeAbi")
            } else {
                LOG.warn("prebuild-install failed (exit=$exitCode): $output")
                // Try npm rebuild as last resort
                val npmPath = File(nodeBinDir, "npm").absolutePath
                LOG.info("Attempting npm rebuild better-sqlite3...")
                val rebuildProc = ProcessBuilder(npmPath, "rebuild", "better-sqlite3")
                rebuildProc.directory(coreDir)
                rebuildProc.environment().putAll(envWithNode)
                rebuildProc.redirectErrorStream(true)
                val rebuildProcess = rebuildProc.start()
                val rebuildOutput = rebuildProcess.inputStream.bufferedReader().readText()
                val rebuildExit = rebuildProcess.waitFor()
                if (rebuildExit == 0) {
                    LOG.info("npm rebuild better-sqlite3 succeeded")
                } else {
                    LOG.warn("npm rebuild also failed (exit=$rebuildExit): $rebuildOutput")
                    LOG.warn("SQLite lock manager may not work — multi-instance locking disabled")
                }
            }
        } catch (e: Exception) {
            LOG.warn("Native module check failed (non-fatal): ${e.message}")
        }
    }

    private fun notifyError(project: Project, content: String) {
        try {
            NotificationGroupManager.getInstance()
                .getNotificationGroup("Cline Notifications")
                .createNotification(content, NotificationType.ERROR)
                .notify(project)
        } catch (_: Exception) {
            // Notification group not registered yet, fall back to LOG
            LOG.error(content)
        }
    }

    override suspend fun execute(project: Project) {
        withContext(Dispatchers.IO) {
            try {
                // Allocate random port for host bridge gRPC server
                val hostBridgePort = ServerSocket(0).use { it.localPort }

                val healthStatusManager = HealthStatusManager()
                healthStatusManager.setStatus("", HealthCheckResponse.ServingStatus.SERVING)

                ServerBuilder.forPort(hostBridgePort)
                    .addService(healthStatusManager.healthService)
                    .addService(EnvServiceImpl())
                    .addService(WorkspaceServiceImpl(project))
                    .addService(WindowServiceImpl(project))
                    .addService(DiffServiceImpl(project))
                    .build()
                    .start()

                LOG.info("Kotlin gRPC Host Bridge started on port $hostBridgePort")

                // ProtoBus port (fixed at 26040 to match webview WebSocket hardcoded port 26041)
                val allocatedProtobusPort = 26040
                protobusPort = allocatedProtobusPort
                // Kill leftover processes on BOTH ports (gRPC + WebSocket)
                killProcessOnPort(allocatedProtobusPort)
                killProcessOnPort(allocatedProtobusPort + 1)

                val coreScriptFile = resolveCoreScriptPath()

                if (coreScriptFile != null && File(coreScriptFile).exists()) {
                    val nodePath = resolveNodePath()
                    LOG.info("Node.js path: $nodePath")

                    // Ensure native modules match the user's Node.js version (run in background
                    // to avoid blocking cline-core startup — SQLite has a non-fatal fallback)
                    Thread {
                        ensureNativeModules(nodePath, File(coreScriptFile).parentFile)
                    }.start()

                    val processBuilder = ProcessBuilder(nodePath, coreScriptFile)

                    val environment = processBuilder.environment()
                    environment["HOST_BRIDGE_ADDRESS"] = "127.0.0.1:$hostBridgePort"
                    environment["DEV_WORKSPACE_FOLDER"] = project.basePath ?: ""
                    environment["PROTOBUS_PORT"] = allocatedProtobusPort.toString()

                    // IntelliJ JVM has minimal PATH (/usr/bin:/bin:/usr/sbin:/sbin).
                    // Resolve the user's full shell PATH so cline-core can find binaries like rg, git, etc.
                    try {
                        val shell = System.getenv("SHELL") ?: "/bin/bash"
                        val pathProc = ProcessBuilder(shell, "-l", "-c", "echo \$PATH")
                            .redirectErrorStream(true).start()
                        val shellPath = pathProc.inputStream.bufferedReader().readLine()?.trim()
                        pathProc.waitFor()
                        if (!shellPath.isNullOrBlank()) {
                            environment["PATH"] = shellPath
                            LOG.info("Resolved shell PATH for cline-core: $shellPath")
                        }
                    } catch (e: Exception) {
                        LOG.warn("Failed to resolve shell PATH: ${e.message}")
                        // Fallback: append common binary locations to existing PATH
                        val currentPath = environment["PATH"] ?: ""
                        val extraPaths = listOf(
                            "/opt/homebrew/bin", "/usr/local/bin",
                            File(nodePath).parent  // node's bin directory (for npm, npx)
                        ).joinToString(":")
                        environment["PATH"] = "$extraPaths:$currentPath"
                    }

                    processBuilder.redirectErrorStream(true)
                    val process = processBuilder.start()
                    coreProcess = process

                    // Register JVM shutdown hook to kill cline-core when IntelliJ exits
                    Runtime.getRuntime().addShutdownHook(Thread {
                        try {
                            if (process.isAlive) {
                                LOG.info("Shutdown hook: killing cline-core (PID: ${process.pid()})")
                                process.destroyForcibly()
                            }
                        } catch (_: Exception) { /* best-effort cleanup */ }
                    })

                    LOG.info("Node.js core backend started (PID: ${process.pid()}, ProtoBus: $allocatedProtobusPort, WS: ${allocatedProtobusPort + 1})")

                    // Signal that cline-core is starting (port is allocated)
                    ready.countDown()

                    Thread {
                        val reader = BufferedReader(InputStreamReader(process.inputStream))
                        reader.forEachLine { line ->
                            LOG.info("[cline-core] $line")
                        }
                        // If the reader loop ends, the process exited
                        val exitCode = process.waitFor()
                        LOG.warn("[cline-core] Process exited with code $exitCode")
                    }.start()

                } else {
                    val msg = "Cline: Could not find cline-core.js. Please set CLINE_CORE_PATH or rebuild with 'node esbuild.mjs --standalone'."
                    LOG.error(msg)
                    notifyError(project, msg)
                }

            } catch (e: Exception) {
                LOG.error("Cline bridge initialization failed", e)
                notifyError(project, "Cline initialization failed: ${e.message}")
            }
        }
    }
}
