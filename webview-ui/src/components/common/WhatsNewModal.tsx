import { BannerAction, BannerCardData } from "@shared/cline/banner"
import React, { useCallback } from "react"
import { useMount } from "react-use"
import DiscordIcon from "@/assets/DiscordIcon"
import GitHubIcon from "@/assets/GitHubIcon"
import LinkedInIcon from "@/assets/LinkedInIcon"
import RedditIcon from "@/assets/RedditIcon"
import XIcon from "@/assets/XIcon"
import WhatsNewItems from "@/components/common/WhatsNewItems"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { useTranslation } from "@/i18n/useTranslation"
import { useApiConfigurationHandlers } from "../settings/utils/useApiConfigurationHandlers"

interface WhatsNewModalProps {
	open: boolean
	onClose: () => void
	version: string
	welcomeBanners?: BannerCardData[]
	onBannerAction?: (action: BannerAction) => void
}

export const WhatsNewModal: React.FC<WhatsNewModalProps> = ({ open, onClose, version, welcomeBanners, onBannerAction }) => {
	const { t } = useTranslation()
	const { openRouterModels, refreshOpenRouterModels, navigateToSettingsModelPicker } = useExtensionState()
	const { handleFieldsChange } = useApiConfigurationHandlers()

	// Get latest model list in case user hits shortcut button to set model
	useMount(refreshOpenRouterModels)

	const navigateToModelPicker = useCallback(
		(initialModelTab: "recommended" | "free", modelId?: string) => {
			// Switch to Cline provider first so the model picker tab works
			// Optionally also set the model if provided
			const updates: Record<string, any> = {
				planModeApiProvider: "cline",
				actModeApiProvider: "cline",
			}
			if (modelId) {
				updates.planModeOpenRouterModelId = modelId
				updates.actModeOpenRouterModelId = modelId
				updates.planModeOpenRouterModelInfo = openRouterModels[modelId]
				updates.actModeOpenRouterModelInfo = openRouterModels[modelId]
			}
			handleFieldsChange(updates)
			onClose()
			navigateToSettingsModelPicker({ targetSection: "api-config", initialModelTab })
		},
		[handleFieldsChange, navigateToSettingsModelPicker, onClose, openRouterModels],
	)

	const inlineCodeStyle: React.CSSProperties = {
		backgroundColor: "var(--vscode-textCodeBlock-background)",
		padding: "2px 6px",
		borderRadius: "3px",
		fontFamily: "var(--vscode-editor-font-family)",
		fontSize: "0.9em",
	}

	return (
		<Dialog onOpenChange={(isOpen) => !isOpen && onClose()} open={open}>
			<DialogContent
				aria-describedby="whats-new-description"
				aria-labelledby="whats-new-title"
				className="pt-5 px-5 pb-4 gap-0">
				<div id="whats-new-description">
					<h2
						className="text-lg font-semibold mb-3 pr-6"
						id="whats-new-title"
						style={{ color: "var(--vscode-editor-foreground)" }}>
						🎉 {t("whatsNew.title").replace("{version}", version)}
					</h2>

					<WhatsNewItems
						inlineCodeStyle={inlineCodeStyle}
						onBannerAction={onBannerAction}
						onClose={onClose}
						onNavigateToModelPicker={navigateToModelPicker}
						welcomeBanners={welcomeBanners}
					/>

					{/* Social Icons Section */}
					<div className="flex flex-col items-center gap-3 mt-4 pt-4 border-t border-[var(--vscode-widget-border)]">
						{/* Icon Row */}
						<div className="flex items-center gap-4">
							{/* X/Twitter */}
							<a
								aria-label={t("whatsNew.followOnX")}
								className="text-[var(--vscode-foreground)] hover:text-[var(--vscode-textLink-activeForeground)] transition-colors"
								href="https://x.com/cline"
								rel="noopener noreferrer"
								target="_blank">
								<XIcon />
							</a>

							{/* Discord */}
							<a
								aria-label={t("whatsNew.joinDiscord")}
								className="text-[var(--vscode-foreground)] hover:text-[var(--vscode-textLink-activeForeground)] transition-colors"
								href="https://discord.gg/cline"
								rel="noopener noreferrer"
								target="_blank">
								<DiscordIcon />
							</a>

							{/* GitHub */}
							<a
								aria-label={t("whatsNew.starOnGitHub")}
								className="text-[var(--vscode-foreground)] hover:text-[var(--vscode-textLink-activeForeground)] transition-colors"
								href="https://github.com/cline/cline"
								rel="noopener noreferrer"
								target="_blank">
								<GitHubIcon />
							</a>

							{/* Reddit */}
							<a
								aria-label={t("whatsNew.joinSubreddit")}
								className="text-[var(--vscode-foreground)] hover:text-[var(--vscode-textLink-activeForeground)] transition-colors"
								href="https://www.reddit.com/r/cline/"
								rel="noopener noreferrer"
								target="_blank">
								<RedditIcon />
							</a>

							{/* LinkedIn */}
							<a
								aria-label={t("whatsNew.followOnLinkedIn")}
								className="text-[var(--vscode-foreground)] hover:text-[var(--vscode-textLink-activeForeground)] transition-colors"
								href="https://www.linkedin.com/company/clinebot/"
								rel="noopener noreferrer"
								target="_blank">
								<LinkedInIcon />
							</a>
						</div>

						{/* GitHub Star CTA */}
						<p className="text-sm text-center" style={{ color: "var(--vscode-descriptionForeground)" }}>
							{t("whatsNew.supportText")}{" "}
							<a
								href="https://github.com/cline/cline"
								rel="noopener noreferrer"
								style={{ color: "var(--vscode-textLink-foreground)" }}
								target="_blank">
								{t("whatsNew.githubStar")}
							</a>
							.
						</p>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}

export default WhatsNewModal
