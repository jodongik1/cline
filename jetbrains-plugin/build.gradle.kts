plugins {
    id("java")
    // Kotlin JVM 플러그인: IntelliJ 플러그인 개발의 기본 언어
    id("org.jetbrains.kotlin.jvm") version "1.9.22"
    // IntelliJ 공식 플러그인: SDK 설정 및 IDE 실행/배포 담당
    id("org.jetbrains.intellij") version "1.17.4"
    // Protobuf 플러그인: gRPC 통신을 위한 코드 생성 담당
    id("com.google.protobuf") version "0.9.4"
}

group = "bot.cline.ide"
version = "1.0.0"

repositories {
    mavenCentral()
}

// IntelliJ 플랫폼 설정
intellij {
    // 대상 IntelliJ 버전 (2024.3 최신 버전 기반)
    version.set("2024.3")
    // IU: IntelliJ IDEA Ultimate Edition 기반 개발
    type.set("IU")
    // 플러그인 의존성: 자바 및 터미널 기능 활성화
    plugins.set(listOf("com.intellij.java", "terminal"))
}

dependencies {
    // Kotlin용 gRPC 및 Protobuf 종속성
    implementation("io.grpc:grpc-netty-shaded:1.60.0")
    implementation("io.grpc:grpc-protobuf:1.60.0")
    implementation("io.grpc:grpc-stub:1.60.0")
    implementation("io.grpc:grpc-kotlin-stub:1.4.1")
    implementation("com.google.protobuf:protobuf-kotlin:3.21.12")

    // gRPC Health Check 서비스 (에이전트와의 연결 확인용)
    implementation("io.grpc:grpc-services:1.60.0")

    // Kotlin 코루틴: 비동기 처리용
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")

    // gRPC와 서블릿 라이브러리 간의 패키지 충돌 방지를 위한 어노테이션 API
    compileOnly("org.apache.tomcat:annotations-api:6.0.53")
}

// Protobuf 코드 생성 설정
protobuf {
    protoc {
        artifact = "com.google.protobuf:protoc:3.21.12"
    }
    plugins {
        create("grpc") {
            artifact = "io.grpc:protoc-gen-grpc-java:1.60.0"
        }
        create("grpckotlin") {
            artifact = "io.grpc:protoc-gen-grpc-kotlin:1.4.1:jdk8@jar"
        }
    }
    generateProtoTasks {
        all().forEach { task ->
            task.plugins {
                create("grpc")
                create("grpckotlin")
            }
        }
    }
}

// 프로젝트 루트의 proto 디렉터리를 Protobuf 소스 셋으로 매핑
sourceSets {
    main {
        proto {
            srcDir("../proto")
        }
    }
}

// 전체 dist-standalone 디렉터리(핵심 에이전트 로직)를 플러그인 패키지에 포함
val bundleClineCore = tasks.register<Copy>("bundleClineCore") {
    description = "dist-standalone 내용을 플러그인 샌드박스로 번들링합니다."
    from("${rootProject.projectDir}/../dist-standalone") {
        exclude("node_modules/**") // 별도로 처리하므로 제외
        exclude("*.map")           // 소스맵 제외
        exclude("standalone.zip")
        exclude("package.json")
        exclude("package-lock.json")
    }
    into("${buildDir}/idea-sandbox/plugins/${intellij.pluginName.get()}/dist-standalone")
}

/**
 * 런타임에 사용할 Node.js 버전에 맞는 npm 경로를 찾아냅니다.
 * ClineProjectActivity(Kotlin)의 로직과 동일하게 nvm 등을 우선 탐색합니다.
 */
fun resolveNpmPath(): String {
    // 1. CLINE_NODE_PATH 환경 변수 확인
    System.getenv("CLINE_NODE_PATH")?.let { nodePath ->
        val npmPath = File(File(nodePath).parentFile, "npm").absolutePath
        if (File(npmPath).exists()) return npmPath
    }
    // 2. nvm 디렉터리 스캔 (설치된 최신 버전을 선택)
    val home = System.getProperty("user.home") ?: ""
    val nvmDir = File(home, ".nvm/versions/node")
    if (nvmDir.isDirectory) {
        nvmDir.listFiles()?.filter { it.isDirectory }?.sortedDescending()?.forEach { dir ->
            val npm = File(dir, "bin/npm")
            if (npm.exists()) return npm.absolutePath
        }
    }
    // 3. Homebrew 또는 시스템 표준 경로 확인
    listOf("/opt/homebrew/bin/npm", "/usr/local/bin/npm", "/usr/bin/npm").forEach {
        if (File(it).exists()) return it
    }
    return "npm"
}

// 런타임에 필요한 외부 node_modules(native 바인딩 포함)를 별도로 설치 및 스테이징
val nodeModulesStaging = "${buildDir}/node-modules-staging"
val installNodeModules = tasks.register<Exec>("installNodeModules") {
    description = "에이전트 실행에 필요한 외부 node_modules를 설치합니다."
    doFirst {
        val stagingDir = file(nodeModulesStaging)
        stagingDir.mkdirs()
        // 필요한 외부 종속성만 포함된 최소한의 package.json 생성
        val parentPkg = groovy.json.JsonSlurper().parseText(
            file("${rootProject.projectDir}/../package.json").readText()
        ) as Map<*, *>
        val allDeps = (parentPkg["dependencies"] as? Map<*, *>) ?: emptyMap<String, String>()
        val externalMods = listOf("grpc-health-check", "@grpc/reflection", "better-sqlite3")
        val deps = externalMods.associateWith { mod ->
            allDeps[mod]?.toString() ?: "*"
        }
        val pkgJson = groovy.json.JsonBuilder(mapOf(
            "name" to "cline-external-deps",
            "version" to "1.0.0",
            "private" to true,
            "dependencies" to deps
        )).toPrettyString()
        file("$nodeModulesStaging/package.json").writeText(pkgJson)
    }
    val npmPath = resolveNpmPath()
    logger.lifecycle("사용 중인 npm 경로: $npmPath")
    workingDir = file(nodeModulesStaging)
    commandLine(npmPath, "install", "--production")
}

// 설치된 node_modules를 플러그인 샌드박스로 복사
val bundleNodeModules = tasks.register<Copy>("bundleNodeModules") {
    description = "설치된 node_modules를 플러그인 샌드박스로 번들링합니다."
    dependsOn(installNodeModules)
    from("$nodeModulesStaging/node_modules")
    into("${buildDir}/idea-sandbox/plugins/${intellij.pluginName.get()}/dist-standalone/node_modules")
}

// 웹 UI 빌드 자산(React build)을 플러그인 샌드박스로 복사
val bundleWebview = tasks.register<Copy>("bundleWebview") {
    description = "React 웹 UI 빌드 파일을 플러그인 샌드박스로 번들링합니다."
    from("${rootProject.projectDir}/../webview-ui/build")
    into("${buildDir}/idea-sandbox/plugins/${intellij.pluginName.get()}/webview")
}

tasks {
    // IDE 실행 시 JCEF(내장 크로미움) 원격 디버깅 활성화 (chrome://inspect 포트 9222)
    runIde {
        jvmArgs("-Dide.browser.jcef.debug.port=9222")
    }

    // JVM 호환성 버전 설정 (JDK 17 기반)
    withType<JavaCompile> {
        sourceCompatibility = "17"
        targetCompatibility = "17"
    }
    withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompile> {
        kotlinOptions.jvmTarget = "17"
    }

    // 플러그인 호환 범위 설정
    patchPluginXml {
        sinceBuild.set("243") // 2024.3 버전 이상 호환
        untilBuild.set("")
    }

    // 플러그인 패키징 전 모든 외부 자산(Node.js, UI 등)이 준비되었는지 확인
    prepareSandbox {
        dependsOn(bundleClineCore, bundleNodeModules, bundleWebview)
    }

    // 최종 배포용 .zip 파일 구성 설정
    buildPlugin {
        dependsOn(bundleClineCore, bundleNodeModules, bundleWebview)
        duplicatesStrategy = DuplicatesStrategy.EXCLUDE
        
        // 에이전트 핵심 파일 포함
        from("${rootProject.projectDir}/../dist-standalone") {
            exclude("node_modules/**")
            exclude("*.map")
            exclude("standalone.zip")
            exclude("package.json")
            exclude("package-lock.json")
            into("dist-standalone")
        }
        // 스테이징 과정에서 설치된 완벽한 node_modules 포함
        from("$nodeModulesStaging/node_modules") {
            into("dist-standalone/node_modules")
        }
        // 웹 UI 리소스 포함
        from("${rootProject.projectDir}/../webview-ui/build") {
            into("webview")
        }
    }

    // 플러그인 서명 (Marketplace 배포용)
    signPlugin {
        certificateChain.set(System.getenv("CERTIFICATE_CHAIN"))
        privateKey.set(System.getenv("PRIVATE_KEY"))
        password.set(System.getenv("PRIVATE_KEY_PASSWORD"))
    }

    // 플러그인 게시 (Marketplace 배포용)
    publishPlugin {
        token.set(System.getenv("PUBLISH_TOKEN"))
    }
}
