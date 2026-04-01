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
	"chat.messagePlaceholder": "Type a message...",
	"chat.taskPlaceholder": "What would you like to do?",
	"chat.inputHint": "@ to add context, / for slash commands & workflows, drag and drop files/images with shift",
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

	// Action Buttons (buttonConfig)
	"buttons.retry": "Retry",
	"buttons.startNewTask": "Start New Task",
	"buttons.startNewTaskWithContext": "Start New Task with Context",
	"buttons.proceedAnyways": "Proceed Anyways",
	"buttons.approve": "Approve",
	"buttons.reject": "Reject",
	"buttons.save": "Save",
	"buttons.runCommand": "Run Command",
	"buttons.proceedWhileRunning": "Proceed While Running",
	"buttons.resumeTask": "Resume Task",
	"buttons.condenseConversation": "Condense Conversation",
	"buttons.reportGitHubIssue": "Report GitHub issue",
	"buttons.cancel": "Cancel",

	// History Preview
	"historyPreview.recent": "Recent",
	"historyPreview.viewAll": "View All",
	"historyPreview.viewAllAriaLabel": "View all history",
	"historyPreview.favoritedAriaLabel": "Favorited",
	"historyPreview.noRecentTasks": "No recent tasks",

	// MCP Configuration View
	"mcp.title": "MCP Servers",
	"mcp.tab.marketplace": "Marketplace",
	"mcp.tab.remoteServers": "Remote Servers",
	"mcp.tab.configure": "Configure",

	// MCP Server Row
	"mcp.server.restart": "Restart Server",
	"mcp.server.restarting": "Restarting...",
	"mcp.server.delete": "Delete Server",
	"mcp.server.deleting": "Deleting...",
	"mcp.server.retryConnection": "Retry Connection",
	"mcp.server.retrying": "Retrying...",
	"mcp.server.tabs.tools": "Tools",
	"mcp.server.tabs.resources": "Resources",
	"mcp.server.tabs.prompts": "Prompts",
	"mcp.server.autoApproveAll": "Auto-approve all tools",
	"mcp.server.noTools": "No tools found",
	"mcp.server.noResources": "No resources found",
	"mcp.server.noPrompts": "No prompts found",
	"mcp.server.requestTimeout": "Request Timeout",
	"mcp.server.alwaysEnabled": "This server can't be disabled because it is enabled by your organization",
	"mcp.server.authenticate": "Authenticate",
	"mcp.tool.autoApprove": "Auto-approve",
	"mcp.tool.parameters": "Parameters",
	"mcp.tool.noDescription": "No description",
	"mcp.resource.returns": "Returns",
	"mcp.resource.noDescription": "No description",
	"mcp.prompt.arguments": "Arguments",
	"mcp.prompt.noDescription": "No description",

	// MCP Configure View
	"mcp.configure.remoteManaged": "Your organization manages some MCP servers",
	"mcp.configure.openSettings": "Configure MCP Servers",
	"mcp.configure.advancedSettings": "Advanced MCP Settings",
	"mcp.noServersInstalled": "No MCP servers installed",

	// MCP Timeout Options
	"mcp.timeout.30s": "30 seconds",
	"mcp.timeout.1m": "1 minute",
	"mcp.timeout.5m": "5 minutes",
	"mcp.timeout.10m": "10 minutes",
	"mcp.timeout.30m": "30 minutes",
	"mcp.timeout.1h": "1 hour",

	// MCP Marketplace
	"mcp.marketplace.loadError": "Failed to load marketplace data",
	"mcp.marketplace.retry": "Retry",
	"mcp.marketplace.searchPlaceholder": "Search MCPs...",
	"mcp.marketplace.clearSearch": "Clear search",
	"mcp.marketplace.filter": "Filter:",
	"mcp.marketplace.allCategories": "All Categories",
	"mcp.marketplace.sort": "Sort:",
	"mcp.marketplace.sortMostInstalls": "Most Installs",
	"mcp.marketplace.sortNewest": "Newest",
	"mcp.marketplace.sortStars": "GitHub Stars",
	"mcp.marketplace.sortName": "Name",
	"mcp.marketplace.orgPreconfigured": "Your organization has pre-configured the available MCP servers",
	"mcp.marketplace.noMatchingServers": "No matching MCP servers found",
	"mcp.marketplace.noServers": "No MCP servers found in the marketplace",
	"mcp.marketplace.install": "Install",
	"mcp.marketplace.installing": "Installing...",
	"mcp.marketplace.installed": "Installed",
	"mcp.marketplace.requiresApiKey": "Requires API key",
	"mcp.marketplace.submit": "Submit MCP Server",
	"mcp.marketplace.submitDescription": "Help others discover great MCP servers by submitting an issue to",

	// MCP Add Remote Server
	"mcp.addRemote.serverNameRequired": "Server name is required",
	"mcp.addRemote.serverUrlRequired": "Server URL is required",
	"mcp.addRemote.invalidUrl": "Invalid URL format",
	"mcp.addRemote.failedToAdd": "Failed to add server",
	"mcp.addRemote.serverName": "Server Name",
	"mcp.addRemote.serverUrl": "Server URL",
	"mcp.addRemote.transportType": "Transport Type",
	"mcp.addRemote.connecting": "Connecting...",
	"mcp.addRemote.addServer": "Add Server",
	"mcp.addRemote.editConfig": "Edit Configuration",
	"mcp.addRemote.learnMore": "here.",
	"mcp.addRemote.description": "Enter a name and URL endpoint to add a remote MCP server.",

	// MCP Add Local Server
	"mcp.addLocal.openSettings": "Open cline_mcp_settings.json",
	"mcp.addLocal.learnMore": "here.",

	// MCP Display Mode
	"mcp.displayMode.plainText": "Plain Text",
	"mcp.displayMode.richDisplay": "Rich Display",
	"mcp.displayMode.markdown": "Markdown",

	// MCP Response Display
	"mcp.response.response": "Response",
	"mcp.response.responseError": "Response (Error)",
	"mcp.response.parseError": "Error parsing response:",

	// Focus Chain
	"focusChain.completed": "All tasks have been completed!",
	"focusChain.label": "To-Do list",
	"focusChain.newSteps": "New steps will be generated if you continue the task",
	"focusChain.clickToEdit": "Click to edit to-do list in file",
	"focusChain.collapse": "Collapse focus chain",
	"focusChain.expand": "Expand focus chain",

	// Browser Session
	"browser.sessionStarted": "Browser Session Started",
	"browser.usingBrowser": "Cline is using the browser:",
	"browser.wantsBrowser": "Cline wants to use the browser:",
	"browser.step": "step",
	"browser.consoleLogs": "Console Logs",
	"browser.noNewLogs": "(No new logs)",
	"browser.previous": "Previous",
	"browser.next": "Next",
	"browser.screenshotAlt": "Browser screenshot",
	"browser.action.label": "Browse Action:",
	"browser.action.launchPrefix": "Launch browser at",
	"browser.action.clickPrefix": "Click",
	"browser.action.typePrefix": "Type",
	"browser.action.scrollDown": "Scroll down",
	"browser.action.scrollUp": "Scroll up",
	"browser.action.close": "Close browser",

	// Errors
	"error.loggedOut": "Whoops looks like you're logged out \u2013 click below to sign in",
	"error.signIn": "Sign in to Cline",
	"error.clickRetry": '(Click "Retry" below)',
	"error.powershellPrefix": "It seems like you're having Windows PowerShell issues, please see this",
	"error.powershellLink": "troubleshooting guide",
	"error.powershellSuffix": ".",
	"error.diffError": "The model used search patterns that don't match anything in the file. Retrying...",
	"error.clineignorePrefix": "Cline tried to access",
	"error.clineignoreSuffix": "which is blocked by the .clineignore file.",

	// Credit Limit Error
	"creditLimit.currentBalance": "Current Balance:",
	"creditLimit.totalSpent": "Total Spent:",
	"creditLimit.totalPromotions": "Total Promotions:",
	"creditLimit.buyCredits": "Buy Credits",
	"creditLimit.retryRequest": "Retry Request",

	// Common UI
	"common.copy": "Copy",
	"common.copied": "Copied",
	"common.quoteSelection": "Quote selection",
	"common.quoteSelectionInReply": "Quote selection in reply",

	// Alert Dialog
	"dialog.unsavedChanges.title": "Unsaved Changes",
	"dialog.unsavedChanges.description": "You have unsaved changes. Are you sure you want to discard them?",
	"dialog.unsavedChanges.confirm": "Discard Changes",
	"dialog.unsavedChanges.save": "Save & Continue",
	"dialog.cancel": "Cancel",

	// Slash Command Menu
	"slashMenu.defaultCommands": "Default Commands",
	"slashMenu.workflowCommands": "Workflow Commands",
	"slashMenu.mcpPrompts": "MCP Prompts",
	"slashMenu.noResults": "No matching commands found",
	"slashMenu.ariaLabel": "Slash commands",

	// Context Menu
	"contextMenu.problems": "Problems",
	"contextMenu.terminal": "Terminal",
	"contextMenu.pasteUrl": "Paste URL to fetch contents",
	"contextMenu.noResults": "No results found",
	"contextMenu.gitCommits": "Git Commits",
	"contextMenu.addFile": "Add File",
	"contextMenu.addFolder": "Add Folder",

	// Thinking Row
	"thinking.title": "Thinking",

	// Hook Message
	"hook.label": "Hook:",
	"hook.status.running": "Running",
	"hook.status.failed": "Failed",
	"hook.status.aborted": "Aborted",
	"hook.status.completed": "Completed",
	"hook.status.unknown": "Unknown",
	"hook.abort": "Abort",
	"hook.timeout": "Took longer than 30 seconds. Check for infinite loops or add timeouts to network requests.",
	"hook.invalidJson": "Hook returned invalid JSON. See error details below for more information.",

	// Task Feedback
	"feedback.helpful": "This was helpful",
	"feedback.notHelpful": "This wasn't helpful",

	// User Message (Checkpoints)
	"checkpoint.restoreAll": "Restore All",
	"checkpoint.restoreAllTitle": "Restore both the chat and workspace files to this checkpoint and send your edited message",
	"checkpoint.restoreChat": "Restore Chat",
	"checkpoint.restoreChatTitle": "Restore just the chat to this checkpoint and send your edited message",

	// MCP Server Toggle Modal
	"mcpModal.manage": "Manage MCP Servers",
	"mcpModal.hide": "Hide MCP Servers",
	"mcpModal.show": "Show MCP Servers",
	"mcpModal.title": "MCP Servers",
	"mcpModal.goToSettings": "Go to MCP server settings",

	// Telemetry Banner
	"telemetry.banner.title": "Help Improve Cline",
	"telemetry.banner.subtitle": "(and access experimental features)",
	"telemetry.banner.description":
		"Cline collects error and usage data to help us fix bugs and improve the extension. No code, prompts, or personal information is ever sent.",
	"telemetry.banner.turnOffPrefix": "You can turn this setting off in ",
	"telemetry.banner.settings": "settings",
	"telemetry.banner.turnOffSuffix": ".",
	"telemetry.banner.closeAriaLabel": "Close banner and enable telemetry",

	// Feature Tips
	"featureTip.label": "Tip:",
	"featureTip.0": 'Enable "Double-Check Completion" in settings to have Cline verify its work before finishing a task.',
	"featureTip.1": "Add a .clinerules file to your project root to give Cline project-specific instructions.",
	"featureTip.2": "Switch to Plan Mode to discuss and plan an approach before Cline takes action.",
	"featureTip.3": "Use @ in the chat input to add files, folders, or URLs as context for your task.",
	"featureTip.4": "Set up MCP Servers to give Cline access to external tools and APIs.",
	"featureTip.5": "Cline creates checkpoints after changes \u2014 you can always restore to a previous state.",
	"featureTip.6": "Use /compact to condense long conversations and free up context window space.",
	"featureTip.7": "Enable auto-approve for read-only tools like file reads to speed up exploration.",
	"featureTip.8": "Use the quote button to select text from Cline's response and reference it in your reply.",
	"featureTip.9": "You can drag and drop images into the chat to share screenshots with Cline.",
	"featureTip.10": "Cline can browse websites \u2014 ask it to test your local dev server in the browser.",
	"featureTip.11": "Use /reportbug to quickly file a GitHub issue with diagnostic context included.",

	// What's New Modal
	"whatsNew.title": "New in v{version}",
	"whatsNew.supportText": "Please support Cline by",
	"whatsNew.githubStar": "starring us on GitHub",
	"whatsNew.followOnX": "Follow us on X",
	"whatsNew.joinDiscord": "Join our Discord",
	"whatsNew.starOnGitHub": "Star us on GitHub",
	"whatsNew.joinSubreddit": "Join our subreddit",
	"whatsNew.followOnLinkedIn": "Follow us on LinkedIn",

	// Cline Model Picker
	"clineModelPicker.model": "Model",
	"clineModelPicker.recommended": "Recommended",
	"clineModelPicker.free": "Free",
	"clineModelPicker.searchPlaceholder": "Search and select model...",
	"clineModelPicker.clearSearch": "Clear search",

	// Markdown Block
	"markdown.toggleActMode": "Click to toggle to Act Mode",
	"markdown.alreadyActMode": "Already in Act Mode",
	"markdown.actModeLabel": "Act Mode (\u2318\u21E7A)",
}

export default en
