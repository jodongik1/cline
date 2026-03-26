plugins {
    id("java")
    id("org.jetbrains.kotlin.jvm") version "1.9.22"
    id("org.jetbrains.intellij") version "1.17.4"
    id("com.google.protobuf") version "0.9.4"
}

group = "bot.cline.ide"
version = "1.0.0"

repositories {
    mavenCentral()
}

// IntelliJ Platform Setup
intellij {
    version.set("2024.3")
    type.set("IU")
    plugins.set(listOf("com.intellij.java", "terminal"))
}

dependencies {
    // gRPC and Protobuf for Kotlin
    implementation("io.grpc:grpc-netty-shaded:1.60.0")
    implementation("io.grpc:grpc-protobuf:1.60.0")
    implementation("io.grpc:grpc-stub:1.60.0")
    implementation("io.grpc:grpc-kotlin-stub:1.4.1")
    implementation("com.google.protobuf:protobuf-kotlin:3.21.12")

    // gRPC Health Check service (required by cline-core.js host bridge handshake)
    implementation("io.grpc:grpc-services:1.60.0")

    // Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")

    // Tomcat annotations for grpc (avoid javax vs jakarta issues)
    compileOnly("org.apache.tomcat:annotations-api:6.0.53")
}

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

// Map the proto directory to the protobuf plugin source sets.
sourceSets {
    main {
        proto {
            srcDir("../proto")
        }
    }
}

// Bundle the entire dist-standalone directory (cline-core.js, proto/, wasm files, binaries)
// excluding node_modules (handled separately) and sourcemaps
val bundleClineCore = tasks.register<Copy>("bundleClineCore") {
    description = "Bundles dist-standalone into the plugin sandbox"
    from("${rootProject.projectDir}/../dist-standalone") {
        exclude("node_modules/**")
        exclude("*.map")
        exclude("standalone.zip")
        exclude("package.json")
        exclude("package-lock.json")
    }
    into("${buildDir}/idea-sandbox/plugins/${intellij.pluginName.get()}/dist-standalone")
}

// Resolve npm from the same Node.js version that ClineProjectActivity will use at runtime.
// IntelliJ JVM has minimal PATH, so ClineProjectActivity falls back to nvm directory scan
// and picks the highest version. We must match that behavior here.
fun resolveNpmPath(): String {
    // Check CLINE_NODE_PATH env (highest priority, same as Kotlin code)
    System.getenv("CLINE_NODE_PATH")?.let { nodePath ->
        val npmPath = File(File(nodePath).parentFile, "npm").absolutePath
        if (File(npmPath).exists()) return npmPath
    }
    // Scan nvm directories first - pick highest version (matches IntelliJ runtime behavior)
    val home = System.getProperty("user.home") ?: ""
    val nvmDir = File(home, ".nvm/versions/node")
    if (nvmDir.isDirectory) {
        nvmDir.listFiles()?.filter { it.isDirectory }?.sortedDescending()?.forEach { dir ->
            val npm = File(dir, "bin/npm")
            if (npm.exists()) return npm.absolutePath
        }
    }
    // Homebrew / system fallback
    listOf("/opt/homebrew/bin/npm", "/usr/local/bin/npm", "/usr/bin/npm").forEach {
        if (File(it).exists()) return it
    }
    return "npm"
}

// Install external node_modules that esbuild marks as external (native bindings / runtime file loading).
// Uses the user's actual npm (matching the Node.js that will run cline-core) to resolve the complete dependency tree.
val nodeModulesStaging = "${buildDir}/node-modules-staging"
val installNodeModules = tasks.register<Exec>("installNodeModules") {
    description = "Installs external node_modules required by cline-core.js"
    doFirst {
        val stagingDir = file(nodeModulesStaging)
        stagingDir.mkdirs()
        // Write a minimal package.json with only the 3 external dependencies
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
    logger.lifecycle("Using npm at: $npmPath")
    workingDir = file(nodeModulesStaging)
    commandLine(npmPath, "install", "--production")
}

val bundleNodeModules = tasks.register<Copy>("bundleNodeModules") {
    description = "Bundles external node_modules into plugin sandbox"
    dependsOn(installNodeModules)
    from("$nodeModulesStaging/node_modules")
    into("${buildDir}/idea-sandbox/plugins/${intellij.pluginName.get()}/dist-standalone/node_modules")
}

val bundleWebview = tasks.register<Copy>("bundleWebview") {
    description = "Bundles webview build assets into the plugin sandbox"
    from("${rootProject.projectDir}/../webview-ui/build")
    into("${buildDir}/idea-sandbox/plugins/${intellij.pluginName.get()}/webview")
}

tasks {
    // Set the JVM compatibility versions
    withType<JavaCompile> {
        sourceCompatibility = "17"
        targetCompatibility = "17"
    }
    withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompile> {
        kotlinOptions.jvmTarget = "17"
    }

    patchPluginXml {
        sinceBuild.set("243")
        untilBuild.set("")
    }

    // Ensure assets are bundled before prepareSandbox and buildPlugin
    prepareSandbox {
        dependsOn(bundleClineCore, bundleNodeModules, bundleWebview)
    }

    // Include bundled assets in the distributable plugin zip
    buildPlugin {
        dependsOn(bundleClineCore, bundleNodeModules, bundleWebview)
        duplicatesStrategy = DuplicatesStrategy.EXCLUDE
        from("${rootProject.projectDir}/../dist-standalone") {
            exclude("node_modules/**")
            exclude("*.map")
            exclude("standalone.zip")
            exclude("package.json")
            exclude("package-lock.json")
            into("dist-standalone")
        }
        // Bundle complete node_modules from npm install staging
        from("$nodeModulesStaging/node_modules") {
            into("dist-standalone/node_modules")
        }
        from("${rootProject.projectDir}/../webview-ui/build") {
            into("webview")
        }
    }

    signPlugin {
        certificateChain.set(System.getenv("CERTIFICATE_CHAIN"))
        privateKey.set(System.getenv("PRIVATE_KEY"))
        password.set(System.getenv("PRIVATE_KEY_PASSWORD"))
    }

    publishPlugin {
        token.set(System.getenv("PUBLISH_TOKEN"))
    }
}
