#!/bin/bash
set -euo pipefail

# Build webview and run JetBrains plugin for development
# Usage: ./scripts/build-jetbrains-dev.sh [--skip-webview] [--no-run]
#
#   --skip-webview  Skip webview build (use existing build)
#   --no-run        Bundle only, do not launch IntelliJ

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
WEBVIEW_DIR="$ROOT_DIR/webview-ui"
PLUGIN_DIR="$ROOT_DIR/jetbrains-plugin"

SKIP_WEBVIEW=false
NO_RUN=false

for arg in "$@"; do
    case $arg in
        --skip-webview) SKIP_WEBVIEW=true ;;
        --no-run) NO_RUN=true ;;
    esac
done

# Step 1: Build webview
if [ "$SKIP_WEBVIEW" = false ]; then
    echo "▶ Building webview (standalone platform)..."
    cd "$WEBVIEW_DIR"
    PLATFORM=standalone npm run build
    echo "✓ Webview build complete"
else
    echo "⏭ Skipping webview build"
fi

# Step 2: Bundle webview into JetBrains plugin
echo "▶ Bundling webview into JetBrains plugin..."
cd "$PLUGIN_DIR"
./gradlew bundleWebview --rerun-tasks
echo "✓ Bundle complete"

# Step 3: Run IntelliJ
if [ "$NO_RUN" = false ]; then
    echo "▶ Launching IntelliJ with Cline plugin..."
    ./gradlew runIde
fi
