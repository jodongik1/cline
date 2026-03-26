const en: Record<string, string> = {
	// Settings View - Tabs
	"settings.title": "Settings",
	"settings.done": "Done",
	"settings.tab.apiConfig": "API Configuration",
	"settings.tab.apiConfig.tooltip": "API Configuration",
	"settings.tab.features": "Features",
	"settings.tab.features.tooltip": "Feature Settings",
	"settings.tab.browser": "Browser",
	"settings.tab.browser.tooltip": "Browser Settings",
	"settings.tab.terminal": "Terminal",
	"settings.tab.terminal.tooltip": "Terminal Settings",
	"settings.tab.general": "General",
	"settings.tab.general.tooltip": "General Settings",
	"settings.tab.remoteConfig": "Remote Config",
	"settings.tab.remoteConfig.tooltip": "Remotely configured fields",
	"settings.tab.about": "About",
	"settings.tab.about.tooltip": "About Cline",
	"settings.tab.debug": "Debug",
	"settings.tab.debug.tooltip": "Debug Tools",

	// General Settings
	"general.preferredLanguage": "Preferred Language",
	"general.preferredLanguage.description": "The language that Cline should use for communication.",
	"general.telemetry.label": "Allow error and usage reporting",
	"general.telemetry.description":
		"Help improve Cline by sending usage data and error reports. No code, prompts, or personal information are ever sent. See our",
	"general.telemetry.overview": "telemetry overview",
	"general.telemetry.and": "and",
	"general.telemetry.privacy": "privacy policy",
	"general.telemetry.details": "for more details.",
	"general.telemetry.remoteManaged": "This setting is managed by your organization's remote configuration",

	// Feature Settings - Categories
	"features.category.agent": "Agent",
	"features.category.editor": "Editor",
	"features.category.experimental": "Experimental",
	"features.category.advanced": "Advanced",

	// Feature Settings - Agent
	"features.subagents.label": "Subagents",
	"features.subagents.description": "Let Cline run focused subagents in parallel to explore the codebase for you.",
	"features.nativeToolCall.label": "Native Tool Call",
	"features.nativeToolCall.description": "Use native function calling when available",
	"features.parallelToolCalling.label": "Parallel Tool Calling",
	"features.parallelToolCalling.description": "Execute multiple tool calls simultaneously",
	"features.strictPlanMode.label": "Strict Plan Mode",
	"features.strictPlanMode.description": "Prevents file edits while in Plan mode",
	"features.autoCompact.label": "Auto Compact",
	"features.autoCompact.description": "Automatically compress conversation history.",
	"features.focusChain.label": "Focus Chain",
	"features.focusChain.description": "Maintain context focus across interactions",
	"features.focusChain.reminderInterval": "Reminder Interval (1-10)",

	// Feature Settings - Editor
	"features.backgroundEdit.label": "Background Edit",
	"features.backgroundEdit.description": "Allow edits without stealing editor focus",
	"features.checkpoints.label": "Checkpoints",
	"features.checkpoints.description": "Save progress at key points for easy rollback",
	"features.clineWebTools.label": "Cline Web Tools",
	"features.clineWebTools.description": "Access web browsing and search capabilities",
	"features.worktrees.label": "Worktrees",
	"features.worktrees.description": "Enables git worktree management for running parallel Cline tasks.",

	// Feature Settings - Experimental
	"features.yoloMode.label": "Yolo Mode",
	"features.yoloMode.description":
		"Execute tasks without user's confirmation. Auto-switches from Plan to Act mode and disables the ask question tool. Use with extreme caution.",
	"features.doubleCheckCompletion.label": "Double-Check Completion",
	"features.doubleCheckCompletion.description":
		"Rejects the first completion attempt and asks the model to re-verify its work against the original task requirements before accepting.",

	// Feature Settings - Advanced
	"features.hooks.label": "Hooks",
	"features.hooks.description": "Enable lifecycle and tool hooks during task execution.",

	// Feature Settings - MCP & Sound
	"features.mcpDisplay.label": "MCP Server Display",
	"features.mcpDisplay.collapsed": "Collapsed",
	"features.mcpDisplay.expanded": "Expanded",
	"features.sound.label": "Sound Effects",
	"features.sound.enabled": "Enabled",
	"features.sound.disabled": "Disabled",
	"features.sound.volume": "Volume",

	// About
	"about.title": "About",
	"about.version": "Version",
	"about.extensionVersion": "Extension Version",
	"about.clineVersion": "Cline Version",

	// Common
	"common.save": "Save",
	"common.cancel": "Cancel",
	"common.reset": "Reset",
	"common.enabled": "Enabled",
	"common.disabled": "Disabled",
	"common.default": "Default",

	// Auto-Approve
	"autoApprove.label": "Auto-approve:",
	"autoApprove.yolo": "Auto-approve: YOLO",
	"autoApprove.yoloEnabled": "YOLO mode is enabled.",
	"autoApprove.yoloDisable": "Disable it in Settings",
	"autoApprove.none": "None",
	"autoApprove.description": "Let Cline take these actions without asking for approval.",
	"autoApprove.docs": "Docs",
	"autoApprove.notifications.label": "Enable notifications",
	"autoApprove.notifications.description": "Notifications may show abbreviated tool details for safety and privacy.",
	"autoApprove.readFiles.label": "Read project files",
	"autoApprove.readFiles.short": "Read",
	"autoApprove.readFilesExternally.label": "Read all files",
	"autoApprove.readFilesExternally.short": "Read (all)",
	"autoApprove.editFiles.label": "Edit project files",
	"autoApprove.editFiles.short": "Edit",
	"autoApprove.editFilesExternally.label": "Edit all files",
	"autoApprove.editFilesExternally.short": "Edit (all)",
	"autoApprove.executeSafeCommands.label": "Execute safe commands",
	"autoApprove.executeSafeCommands.short": "Safe Commands",
	"autoApprove.executeAllCommands.label": "Execute all commands",
	"autoApprove.executeAllCommands.short": "All Commands",
	"autoApprove.useBrowser.label": "Use the browser",
	"autoApprove.useBrowser.short": "Browser",
	"autoApprove.useMcp.label": "Use MCP servers",
	"autoApprove.useMcp.short": "MCP",

	// API Configuration
	"api.provider": "API Provider",
	"api.provider.remoteManaged": "Provider options are managed by your organization's remote configuration",
	"api.provider.searchPlaceholder": "Search and select provider...",
	"api.provider.clearSearch": "Clear search",
	"api.useCustomBaseUrl": "Use custom base URL",
	"api.apiKey": "API Key",
	"api.apiKey.placeholder": "Enter API Key...",
	"api.apiKey.helpText": "This key is stored locally and only used to make API requests from this extension.",
	"api.apiKey.signupPrefix": "You can get a",
	"api.apiKey.signupSuffix": "API key by signing up here.",
	"api.model": "Model",
	"api.model.selectPlaceholder": "Select a model...",
	"api.model.searchPlaceholder": "Search and select a model...",
	"api.contextWindow": "Model Context Window",
	"api.requestTimeout": "Request Timeout (ms)",
	"api.requestTimeout.description": "Maximum time in milliseconds to wait for API responses before timing out.",
	"api.compactPrompt": "Use compact prompt",
	"api.compactPrompt.description": "A system prompt optimized for smaller context window (e.g. 8k or less).",
	"api.compactPrompt.noSupport": "Does not support Mcp and Focus Chain",
	"api.planActSeparate": "Use different models for Plan and Act modes",
	"api.planActSeparate.description":
		"Switching between Plan and Act mode will persist the API and model used in the previous mode. This may be helpful e.g. when using a strong reasoning model to architect a plan for a cheaper coding model to act on.",
	"api.planMode": "Plan Mode",
	"api.actMode": "Act Mode",
	"api.ollama.helpText":
		"Optional API key for authenticated Ollama instances or cloud services. Leave empty for local installations.",
	"api.ollama.apiKeyPlaceholder": "Enter API Key (optional)...",
	"api.ollama.fetchError":
		"Unable to fetch models from Ollama server. Please ensure Ollama is running and accessible, or enter the model ID manually above.",
	"api.ollama.description":
		"Ollama allows you to run models locally on your computer. For instructions on how to get started, see their",
	"api.ollama.quickstartGuide": "quickstart guide.",
	"api.ollama.note": "Note:",
	"api.ollama.noteText":
		"Cline uses complex prompts and works best with Claude models. Less capable models may not work as expected.",

	// Features - MCP Display Mode
	"features.mcpDisplayMode.label": "MCP Display Mode",
	"features.mcpDisplayMode.description": "Controls how MCP responses are displayed",
	"features.mcpDisplayMode.plainText": "Plain Text",
	"features.mcpDisplayMode.richDisplay": "Rich Display",
	"features.mcpDisplayMode.markdown": "Markdown",

	// Browser Settings
	"browser.disableToolUsage": "Disable browser tool usage",
	"browser.disableToolUsage.description": "Prevent Cline from using browser actions (e.g. launch, click, type).",
	"browser.viewport.label": "Viewport size",
	"browser.viewport.description": "Set the size of the browser viewport for screenshots and interactions.",
	"browser.remoteBrowser.label": "Use remote browser connection",
	"browser.chromePath.label": "Chrome Executable Path (Optional)",
	"browser.chromePath.autoDetect": "Leave blank to auto-detect.",
	"browser.customArgs.label": "Custom Browser Arguments (Optional)",
	"browser.customArgs.description": "Space-separated arguments to pass to the browser executable.",
	"browser.connection.checking": "Checking connection...",
	"browser.connection.connected": "Connected",
	"browser.connection.notConnected": "Not connected",
	"browser.launchDebugMode": "Launch Browser with Debug Mode",
	"browser.launchingBrowser": "Launching Browser...",

	// Terminal Settings
	"terminal.defaultProfile": "Default Terminal Profile",
	"terminal.defaultProfile.description":
		"Select the default terminal Cline will use. 'Default' uses your VSCode global setting.",
	"terminal.shellTimeout": "Shell integration timeout (seconds)",
	"terminal.shellTimeout.placeholder": "Enter timeout in seconds",
	"terminal.shellTimeout.description":
		"Set how long Cline waits for shell integration to activate before executing commands. Increase this value if you experience terminal connection timeouts.",
	"terminal.shellTimeout.error": "Please enter a positive number",
	"terminal.aggressiveReuse": "Enable aggressive terminal reuse",
	"terminal.aggressiveReuse.description":
		"When enabled, Cline will reuse existing terminal windows that aren't in the current working directory. Disable this if you experience issues with task lockout after a terminal command.",
	"terminal.executionMode": "Terminal Execution Mode",
	"terminal.executionMode.vscode": "VS Code Terminal",
	"terminal.executionMode.background": "Background Exec",
	"terminal.executionMode.description": "Choose whether Cline runs commands in the VS Code terminal or a background process.",
	"terminal.outputLimit": "Terminal output limit",
	"terminal.outputLimit.description":
		"Maximum number of lines to include in terminal output when executing commands. When exceeded, lines will be removed from the middle, saving tokens.",
	"terminal.issues": "Having terminal issues?",
	"terminal.issues.checkOur": "Check our",
	"terminal.issues.quickFixes": "Terminal Quick Fixes",
	"terminal.issues.orThe": "or the",
	"terminal.issues.troubleshooting": "Complete Troubleshooting Guide",

	// About
	"about.description":
		"An AI assistant that can use your CLI and Editor. Cline can handle complex software development tasks step-by-step with tools that let him create & edit files, explore large projects, use the browser, and execute terminal commands (after you grant permission).",
	"about.community": "Community & Support",
	"about.development": "Development",
	"about.featureRequests": "Feature Requests",
	"about.resources": "Resources",
	"about.documentation": "Documentation",

	// Chat
	"chat.placeholder": "Type a message...",
	"chat.send": "Send",

	// History
	"history.title": "History",
	"history.noHistory": "No history yet",
	"history.searchPlaceholder": "Fuzzy search history...",
	"history.deleteAll": "Delete All History",
	"history.sortBy": "Sort by",
	"history.today": "Today",
	"history.older": "Older",
	"history.selectAll": "Select All",
	"history.selectNone": "Select None",
	"history.deleteSelected": "Delete",
	"history.selected": "Selected",
	"history.filter.newest": "Newest",
	"history.filter.oldest": "Oldest",
	"history.filter.mostExpensive": "Most Expensive",
	"history.filter.mostTokens": "Most Tokens",
	"history.filter.mostRelevant": "Most Relevant",
	"history.filter.workspaceOnly": "Workspace Only",
	"history.filter.favoritesOnly": "Favorites Only",
	"common.done": "Done",

	// Account
	"account.title": "Account",
	"account.signupDescription":
		"Sign up for an account to get access to the latest models, billing dashboard to view usage and credits, and more upcoming features.",
	"account.signupButton": "Sign up with Cline",
	"account.agreementPrefix": "By continuing, you agree to the",
	"account.termsOfService": "Terms of Service",
	"account.and": "and",
	"account.privacyPolicy": "Privacy Policy.",

	// Rules / Workflows / Hooks / Skills
	"rules.tab.rules": "Rules",
	"rules.tab.workflows": "Workflows",
	"rules.tab.hooks": "Hooks",
	"rules.tab.skills": "Skills",
	"rules.description":
		"Rules allow you to provide Cline with system-level guidance. Think of them as a persistent way to include context and preferences for your projects or globally for every conversation.",
	"rules.workflows.description":
		"Workflows allow you to define a series of steps to guide Cline through a repetitive set of tasks, such as deploying a service or submitting a PR. To invoke a workflow, type",
	"rules.workflows.invoke": "in the chat.",
	"rules.skills.description":
		"Skills are reusable instruction sets that Cline can activate on-demand. When a task matches a skill's description, Cline uses the",
	"rules.skills.tool": "tool to load the full instructions.",
	"rules.hooks.description":
		"Hooks allow you to execute custom scripts at specific points in Cline's execution lifecycle, enabling automation and integration with external tools.",
	"rules.docs": "Docs",
	"rules.global": "Global Rules",
	"rules.workspace": "Workspace Rules",
	"rules.globalWorkflows": "Global Workflows",
	"rules.workspaceWorkflows": "Workspace Workflows",
	"rules.globalHooks": "Global Hooks",
	"rules.globalSkills": "Global Skills",
	"rules.workspaceSkills": "Workspace Skills",
	"rules.enterpriseRules": "Enterprise Rules",
	"rules.enterpriseWorkflows": "Enterprise Workflows",
	"rules.remoteRules": "Your organization manages some rules",
	"rules.remoteWorkflows": "Your organization manages some workflows",

	// Welcome / Onboarding
	"welcome.title": "Welcome to Cline",
	"welcome.getStarted": "Get Started",
	"welcome.subtitle": "Your autonomous AI coding agent",
	"welcome.whatCanIDo": "What can I do for you?",
	"welcome.takeATour": "Take a Tour",
}

export default en
