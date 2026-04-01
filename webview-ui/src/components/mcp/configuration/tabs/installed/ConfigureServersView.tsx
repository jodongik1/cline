import { EmptyRequest } from "@shared/proto/cline/common"
import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { useTranslation } from "@/i18n/useTranslation"
import { McpServiceClient } from "@/services/grpc-client"
import ServersToggleList from "./ServersToggleList"

const ConfigureServersView = () => {
	const { t } = useTranslation()
	const { mcpServers: servers, navigateToSettings, remoteConfigSettings } = useExtensionState()

	// Check if there are remote MCP servers configured
	const hasRemoteMCPServers = remoteConfigSettings?.remoteMCPServers && remoteConfigSettings.remoteMCPServers.length > 0

	return (
		<div style={{ padding: "16px 20px" }}>
			<div
				style={{
					color: "var(--vscode-foreground)",
					fontSize: "13px",
					marginBottom: "16px",
					marginTop: "5px",
				}}>
				<VSCodeLink href="https://github.com/modelcontextprotocol" style={{ display: "inline" }}>
					Model Context Protocol
				</VSCodeLink>{" "}
				은 추가 도구와 리소스를 제공하는 로컬 MCP 서버와의 통신을 가능하게 하여 Cline의 기능을 확장합니다.{" "}
				<VSCodeLink href="https://github.com/modelcontextprotocol/servers" style={{ display: "inline" }}>
					커뮤니티 서버
				</VSCodeLink>{" "}
				를 사용하거나 Cline에게 워크플로우에 맞는 새 도구를 만들어달라고 요청할 수 있습니다 (예: "최신 npm 문서를 가져오는
				도구 추가").{" "}
				<VSCodeLink href="https://x.com/sdrzn/status/1867271665086074969" style={{ display: "inline" }}>
					데모 보기
				</VSCodeLink>
			</div>

			{/* Remote config banner */}
			{hasRemoteMCPServers && (
				<div className="flex items-center gap-2 px-5 py-3 mb-4 bg-vscode-textBlockQuote-background border-l-[3px] border-vscode-textLink-foreground">
					<i className="codicon codicon-lock text-sm" />
					<span className="text-base">{t("mcp.configure.remoteManaged")}</span>
				</div>
			)}

			<ServersToggleList hasTrashIcon={false} isExpandable={true} servers={servers} />

			{/* Settings Section */}
			<div style={{ marginBottom: "20px", marginTop: 10 }}>
				<VSCodeButton
					appearance="secondary"
					onClick={() => {
						McpServiceClient.openMcpSettings(EmptyRequest.create({})).catch((error) => {
							console.error("Error opening MCP settings:", error)
						})
					}}
					style={{ width: "100%", marginBottom: "5px" }}>
					<span className="codicon codicon-server" style={{ marginRight: "6px" }} />
					{t("mcp.configure.openSettings")}
				</VSCodeButton>

				<div style={{ textAlign: "center" }}>
					<VSCodeLink onClick={() => navigateToSettings("features")} style={{ fontSize: "12px" }}>
						{t("mcp.configure.advancedSettings")}
					</VSCodeLink>
				</div>
			</div>
		</div>
	)
}

export default ConfigureServersView
