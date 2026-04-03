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

/**
 * ClineProjectActivity: 프로젝트가 열릴 때 실행되는 진입점 클래스.
 * 핵심 역할: Node.js 백엔드 프로세스 실행 및 gRPC 통신 브릿지 설정.
 */
class ClineProjectActivity : ProjectActivity {

    companion object {
        private val LOG = Logger.getInstance(ClineProjectActivity::class.java)

        /** 현재 세션에서 할당된 ProtoBus(gRPC) 포트 (0이면 아직 할당되지 않음) */
        @Volatile
        var protobusPort: Int = 0
            private set

        /** WebSocket 포트는 항상 ProtoBus 포트 + 1로 설정됨 */
        val websocketPort: Int get() = protobusPort + 1

        /** cline-core 백엔드가 준비되었음을 알리는 래치(Latch) */
        val ready = java.util.concurrent.CountDownLatch(1)

        /** IntelliJ 종료 시 백엔드 프로세스를 함께 종료하기 위한 참조 */
        @Volatile
        var coreProcess: Process? = null
            private set
    }

    /**
     * 시스템에서 Node.js 실행 파일(binary)의 전체 경로를 탐색합니다.
     * IntelliJ JVM은 셸의 PATH를 상속받지 못하는 경우가 많아 NVM 등을 포함한 여러 경로를 직접 확인합니다.
     */
    private fun resolveNodePath(): String {
        // 1. 환경 변수 CLINE_NODE_PATH 확인
        System.getenv("CLINE_NODE_PATH")?.takeIf { File(it).exists() }?.let { return it }

        // 2. 현재 사용자의 기본 셸(bash, zsh 등)에서 'which node' 실행 시도
        try {
            val shell = System.getenv("SHELL") ?: "/bin/bash"
            val which = ProcessBuilder(shell, "-l", "-c", "which node")
                .redirectErrorStream(true)
                .start()
            val path = which.inputStream.bufferedReader().readLine()?.trim()
            if (!path.isNullOrBlank() && File(path).exists()) return path
        } catch (_: Exception) { /* 무시 및 다음 시도 */ }

        // 3. NVM(Node Version Manager) 설치 경로 탐색
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

        // 4. 일반적인 OS 표준 설치 경로 확인
        for (candidate in listOf("/opt/homebrew/bin/node", "/usr/local/bin/node", "/usr/bin/node")) {
            if (File(candidate).exists()) return candidate
        }

        // 5. 모두 실패 시 시스템 명령어로 'node' 호출 시도
        return "node"
    }

    /**
     * 실행할 핵심 백엔드 스크립트(cline-core.js)의 경로를 찾습니다.
     */
    private fun resolveCoreScriptPath(): String? {
        // 환경 변수 우선 확인
        System.getenv("CLINE_CORE_PATH")?.takeIf { File(it).exists() }?.let {
            LOG.info("CLINE_CORE_PATH를 통해 cline-core.js 발견: $it")
            return it
        }

        val pluginDescriptor = PluginManagerCore.getPlugin(PluginId.getId("bot.cline.ide"))
        val pluginDir = pluginDescriptor?.pluginPath?.toFile()

        if (pluginDir != null) {
            // 번들링된 배포판 경로 확인
            val bundled = File(pluginDir, "dist-standalone/cline-core.js")
            if (bundled.exists()) {
                return bundled.absolutePath
            }

            // 개발 환경(샌드박스 등)에서 상위 디렉터리를 탐색하며 위치 확인
            var dir: File? = pluginDir.parentFile
            repeat(8) {
                if (dir == null) return@repeat
                val candidate = File(dir, "dist-standalone/cline-core.js")
                if (candidate.exists()) {
                    return candidate.absolutePath
                }
                dir = dir?.parentFile
            }
        }
        return null
    }

    /**
     * 지정된 포트를 점유하고 있는 기존 프로세스를 강제로 종료합니다. (포트 충돌 방지)
     */
    private fun killProcessOnPort(port: Int) {
        try {
            val os = System.getProperty("os.name").lowercase()
            if (os.contains("win")) {
                // Windows: netstat와 taskkill 사용
                val result = ProcessBuilder("cmd", "/c", "netstat -ano | findstr :$port")
                    .redirectErrorStream(true).start()
                    .inputStream.bufferedReader().readText().trim()
                val pids = result.lines()
                    .mapNotNull { it.trim().split("\\s+".toRegex()).lastOrNull() }
                    .filter { it.all(Char::isDigit) && it != "0" }
                    .toSet()
                pids.forEach { pid ->
                    ProcessBuilder("taskkill", "/F", "/PID", pid).start().waitFor()
                }
            } else {
                // macOS/Linux: lsof와 kill 사용
                val result = ProcessBuilder("lsof", "-ti", ":$port")
                    .redirectErrorStream(true).start()
                    .inputStream.bufferedReader().readText().trim()
                if (result.isNotBlank()) {
                    result.lines().filter { it.isNotBlank() }.forEach { pid ->
                        ProcessBuilder("kill", pid).start().waitFor()
                    }
                    Thread.sleep(500)
                }
            }
        } catch (e: Exception) {
            LOG.warn("포트 $port의 프로세스 종료 실패: ${e.message}")
        }
    }

    /**
     * 바이너리 종속성(예: better-sqlite3)이 사용자의 Node.js 버전(ABI)과 맞는지 확인하고,
     * 필요 시 npm/npx를 사용하여 자동으로 재설치(rebuild)합니다.
     */
    private fun ensureNativeModules(nodePath: String, coreDir: File) {
        val betterSqliteDir = File(coreDir, "node_modules/better-sqlite3")
        if (!betterSqliteDir.isDirectory) return

        try {
            // 현재 시스템 Node.js의 ABI 버전 확인
            val abiProc = ProcessBuilder(nodePath, "-e", "process.stdout.write(process.versions.modules)")
                .redirectErrorStream(true).start()
            val runtimeAbi = abiProc.inputStream.bufferedReader().readText().trim()
            abiProc.waitFor()

            val nodeFile = File(betterSqliteDir, "build/Release/better_sqlite3.node")
            if (nodeFile.exists()) {
                // 기존 모듈이 정상적으로 로드되는지 테스트
                val checkScript = "try{require('${nodeFile.absolutePath.replace("\\","/")}');process.stdout.write('OK')}catch(e){process.stdout.write('MISMATCH')}"
                val checkProc = ProcessBuilder(nodePath, "-e", checkScript)
                    .redirectErrorStream(true).start()
                val checkResult = checkProc.inputStream.bufferedReader().readText().trim()
                checkProc.waitFor()

                if (checkResult == "OK") return // ABI 일치 시 종료
            }

            // 일치하지 않을 경우 npx prebuild-install 시도
            val nodeBinDir = File(nodePath).parent
            val envWithNode = mapOf("PATH" to "$nodeBinDir:/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin")
            val npxPath = File(nodeBinDir, "npx").absolutePath
            
            val prebuildProc = ProcessBuilder(npxPath, "prebuild-install", "--runtime", "napi", "--target", runtimeAbi)
            prebuildProc.directory(betterSqliteDir)
            prebuildProc.environment().putAll(envWithNode)
            prebuildProc.redirectErrorStream(true)
            val process = prebuildProc.start()
            if (process.waitFor() != 0) {
                // 실패 시 npm rebuild로 재시도
                val npmPath = File(nodeBinDir, "npm").absolutePath
                val rebuildProc = ProcessBuilder(npmPath, "rebuild", "better-sqlite3")
                rebuildProc.directory(coreDir)
                rebuildProc.environment().putAll(envWithNode)
                rebuildProc.start().waitFor()
            }
        } catch (e: Exception) {
            LOG.warn("네이티브 모듈 확인 중 비정상 종료 (치명적이지 않음): ${e.message}")
        }
    }

    private fun notifyError(project: Project, content: String) {
        try {
            NotificationGroupManager.getInstance()
                .getNotificationGroup("Cline Notifications")
                .createNotification(content, NotificationType.ERROR)
                .notify(project)
        } catch (_: Exception) {
            LOG.error(content)
        }
    }

    /**
     * 프로젝트가 열릴 때 실행되는 실제 로직. (프로젝트 액티비티의 메인 루틴)
     */
    override suspend fun execute(project: Project) {
        withContext(Dispatchers.IO) {
            try {
                // 1. 가교 역할을 할 Kotlin gRPC 서버용 포트 할당
                val hostBridgePort = ServerSocket(0).use { it.localPort }

                val healthStatusManager = HealthStatusManager()
                healthStatusManager.setStatus("", HealthCheckResponse.ServingStatus.SERVING)

                // 2. gRPC 서비스들(파일 입출력, 환경 변수, 창 관리 등) 등록 및 시작
                ServerBuilder.forPort(hostBridgePort)
                    .addService(healthStatusManager.healthService)
                    .addService(EnvServiceImpl())
                    .addService(WorkspaceServiceImpl(project))
                    .addService(WindowServiceImpl(project))
                    .addService(DiffServiceImpl(project))
                    .build()
                    .start()

                LOG.info("Kotlin gRPC 호스트 브릿지가 $hostBridgePort 포트에서 시작되었습니다.")

                // 3. 하드코딩된 ProtoBus 포트 설정 (Webview 포트와의 동기화 때문)
                val allocatedProtobusPort = 26040
                protobusPort = allocatedProtobusPort
                
                // 기존 좀비 프로세스 정리
                killProcessOnPort(allocatedProtobusPort)
                killProcessOnPort(allocatedProtobusPort + 1)

                val coreScriptFile = resolveCoreScriptPath()

                if (coreScriptFile != null && File(coreScriptFile).exists()) {
                    val nodePath = resolveNodePath()

                    // 백그라운드에서 네이티브 모듈(better-sqlite3) 호환성 체크 실행
                    Thread {
                        ensureNativeModules(nodePath, File(coreScriptFile).parentFile)
                    }.start()

                    // 4. Node.js 프로세스 실행 설정
                    val processBuilder = ProcessBuilder(nodePath, coreScriptFile)
                    val environment = processBuilder.environment()
                    environment["HOST_BRIDGE_ADDRESS"] = "127.0.0.1:$hostBridgePort"
                    environment["DEV_WORKSPACE_FOLDER"] = project.basePath ?: ""
                    environment["PROTOBUS_PORT"] = allocatedProtobusPort.toString()

                    // 현재 시스템의 셸 PATH를 추출하여 백엔드 프로세스에 전달 (rg, git 등을 찾기 위해 필요)
                    try {
                        val shell = System.getenv("SHELL") ?: "/bin/bash"
                        val pathProc = ProcessBuilder(shell, "-l", "-c", "echo \$PATH")
                            .redirectErrorStream(true).start()
                        val shellPath = pathProc.inputStream.bufferedReader().readLine()?.trim()
                        pathProc.waitFor()
                        if (!shellPath.isNullOrBlank()) {
                            environment["PATH"] = shellPath
                        }
                    } catch (e: Exception) {
                        // 실패 시 기본 경로들을 추가하여 백업
                        val currentPath = environment["PATH"] ?: ""
                        val extraPaths = listOf("/opt/homebrew/bin", "/usr/local/bin").joinToString(":")
                        environment["PATH"] = "$extraPaths:$currentPath"
                    }

                    processBuilder.redirectErrorStream(true)
                    val process = processBuilder.start()
                    coreProcess = process

                    // 5. IntelliJ 종료 시 백엔드 프로세스를 강제 종료하도록 훅 등록
                    Runtime.getRuntime().addShutdownHook(Thread {
                        try {
                            if (process.isAlive) {
                                LOG.info("종료 훅: cline-core 백엔드 종료 중 (PID: ${process.pid()})")
                                process.destroyForcibly()
                            }
                        } catch (_: Exception) { }
                    })

                    LOG.info("Node.js 핵심 백엔드가 시작되었습니다. (PID: ${process.pid()})")

                    // 준비 완료 신호 전송
                    ready.countDown()

                    // 프로세스의 로그(stdout/stderr)를 IDE 로그 창에 출력
                    Thread {
                        val reader = BufferedReader(InputStreamReader(process.inputStream))
                        reader.forEachLine { line ->
                            LOG.info("[cline-core 백엔드] $line")
                        }
                        val exitCode = process.waitFor()
                        LOG.warn("[cline-core 백엔드] 프로세스가 종료 코드 $exitCode 로 종료되었습니다.")
                    }.start()

                } else {
                    val msg = "Cline: cline-core.js를 찾을 수 없습니다. 빌드 상태를 확인해 주세요."
                    LOG.error(msg)
                    notifyError(project, msg)
                }

            } catch (e: Exception) {
                LOG.error("Cline 브릿지 초기화 중 치명적 오류 발생", e)
                notifyError(project, "Cline 초기화 실패: ${e.message}")
            }
        }
    }
}
