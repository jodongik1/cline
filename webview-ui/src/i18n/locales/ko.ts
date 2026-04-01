const ko: Record<string, string> = {
	// Settings View - Tabs
	"settings.title": "설정",
	"settings.done": "완료",
	"settings.tab.apiConfig": "API 설정",
	"settings.tab.apiConfig.tooltip": "API 설정",
	"settings.tab.features": "기능",
	"settings.tab.features.tooltip": "기능 설정",
	"settings.tab.browser": "브라우저",
	"settings.tab.browser.tooltip": "브라우저 설정",
	"settings.tab.terminal": "터미널",
	"settings.tab.terminal.tooltip": "터미널 설정",
	"settings.tab.general": "일반",
	"settings.tab.general.tooltip": "일반 설정",
	"settings.tab.remoteConfig": "원격 설정",
	"settings.tab.remoteConfig.tooltip": "원격으로 관리되는 설정 항목",
	"settings.tab.about": "정보",
	"settings.tab.about.tooltip": "Cline 정보",
	"settings.tab.debug": "디버그",
	"settings.tab.debug.tooltip": "디버그 도구",

	// General Settings
	"general.preferredLanguage": "기본 언어",
	"general.preferredLanguage.description": "Cline이 대화에 사용할 언어입니다.",
	"general.telemetry.label": "오류 및 사용 데이터 보고 허용",
	"general.telemetry.description":
		"사용 데이터와 오류 보고를 전송하여 Cline 개선에 도움을 주세요. 코드, 프롬프트, 개인 정보는 절대 전송되지 않습니다.",
	"general.telemetry.overview": "텔레메트리 개요",
	"general.telemetry.and": "및",
	"general.telemetry.privacy": "개인정보 보호정책",
	"general.telemetry.details": "에서 자세히 확인하세요.",
	"general.telemetry.remoteManaged": "이 설정은 조직의 원격 설정에 의해 관리됩니다",

	// Feature Settings - Categories
	"features.category.agent": "에이전트",
	"features.category.editor": "에디터",
	"features.category.experimental": "실험적 기능",
	"features.category.advanced": "고급",

	// Feature Settings - Agent
	"features.subagents.label": "서브에이전트",
	"features.subagents.description": "Cline이 병렬로 집중 서브에이전트를 실행하여 코드베이스를 탐색합니다.",
	"features.nativeToolCall.label": "네이티브 도구 호출",
	"features.nativeToolCall.description": "가능한 경우 네이티브 함수 호출을 사용합니다",
	"features.parallelToolCalling.label": "병렬 도구 호출",
	"features.parallelToolCalling.description": "여러 도구 호출을 동시에 실행합니다",
	"features.strictPlanMode.label": "엄격한 Plan 모드",
	"features.strictPlanMode.description": "Plan 모드에서 파일 편집을 방지합니다",
	"features.autoCompact.label": "자동 압축",
	"features.autoCompact.description": "대화 기록을 자동으로 압축합니다.",
	"features.focusChain.label": "포커스 체인",
	"features.focusChain.description": "상호작용 간 컨텍스트 포커스를 유지합니다",
	"features.focusChain.reminderInterval": "알림 간격 (1-10)",

	// Feature Settings - Editor
	"features.backgroundEdit.label": "백그라운드 편집",
	"features.backgroundEdit.description": "에디터 포커스를 빼앗지 않고 편집을 허용합니다",
	"features.checkpoints.label": "체크포인트",
	"features.checkpoints.description": "주요 시점에 진행 상황을 저장하여 쉽게 롤백할 수 있습니다",
	"features.clineWebTools.label": "Cline 웹 도구",
	"features.clineWebTools.description": "웹 브라우징 및 검색 기능에 접근합니다",
	"features.worktrees.label": "워크트리",
	"features.worktrees.description": "병렬 Cline 작업을 위한 Git 워크트리 관리를 활성화합니다.",

	// Feature Settings - Experimental
	"features.yoloMode.label": "Yolo 모드",
	"features.yoloMode.description":
		"사용자 확인 없이 작업을 실행합니다. Plan에서 Act 모드로 자동 전환되고 질문 도구가 비활성화됩니다. 극도로 주의하여 사용하세요.",
	"features.doubleCheckCompletion.label": "완료 이중 확인",
	"features.doubleCheckCompletion.description":
		"첫 번째 완료 시도를 거부하고 모델에게 원래 작업 요구사항과 대조하여 작업을 재검증하도록 요청합니다.",

	// Feature Settings - Advanced
	"features.hooks.label": "훅",
	"features.hooks.description": "작업 실행 중 라이프사이클 및 도구 훅을 활성화합니다.",

	// Feature Settings - MCP & Sound
	"features.mcpDisplay.label": "MCP 서버 표시",
	"features.mcpDisplay.collapsed": "접힘",
	"features.mcpDisplay.expanded": "펼침",
	"features.sound.label": "효과음",
	"features.sound.enabled": "켜기",
	"features.sound.disabled": "끄기",
	"features.sound.volume": "볼륨",

	// About
	"about.title": "정보",
	"about.version": "버전",
	"about.extensionVersion": "확장 프로그램 버전",
	"about.clineVersion": "Cline 버전",

	// Common
	"common.save": "저장",
	"common.cancel": "취소",
	"common.reset": "초기화",
	"common.enabled": "활성화",
	"common.disabled": "비활성화",
	"common.default": "기본값",

	// Auto-Approve
	"autoApprove.label": "자동 승인:",
	"autoApprove.yolo": "자동 승인: YOLO",
	"autoApprove.yoloEnabled": "YOLO 모드가 활성화되었습니다.",
	"autoApprove.yoloDisable": "설정에서 비활성화",
	"autoApprove.none": "없음",
	"autoApprove.description": "Cline이 승인 없이 다음 작업을 수행하도록 허용합니다.",
	"autoApprove.docs": "문서",
	"autoApprove.notifications.label": "알림 활성화",
	"autoApprove.notifications.description": "알림에는 보안 및 개인정보 보호를 위해 간략한 도구 정보가 표시됩니다.",
	"autoApprove.readFiles.label": "프로젝트 파일 읽기",
	"autoApprove.readFiles.short": "읽기",
	"autoApprove.readFilesExternally.label": "모든 파일 읽기",
	"autoApprove.readFilesExternally.short": "읽기 (전체)",
	"autoApprove.editFiles.label": "프로젝트 파일 편집",
	"autoApprove.editFiles.short": "편집",
	"autoApprove.editFilesExternally.label": "모든 파일 편집",
	"autoApprove.editFilesExternally.short": "편집 (전체)",
	"autoApprove.executeSafeCommands.label": "안전한 명령 실행",
	"autoApprove.executeSafeCommands.short": "안전 명령",
	"autoApprove.executeAllCommands.label": "모든 명령 실행",
	"autoApprove.executeAllCommands.short": "전체 명령",
	"autoApprove.useBrowser.label": "브라우저 사용",
	"autoApprove.useBrowser.short": "브라우저",
	"autoApprove.useMcp.label": "MCP 서버 사용",
	"autoApprove.useMcp.short": "MCP",

	// API Configuration
	"api.provider": "API 제공자",
	"api.provider.remoteManaged": "제공자 옵션은 조직의 원격 설정에 의해 관리됩니다",
	"api.provider.searchPlaceholder": "제공자 검색 및 선택...",
	"api.provider.clearSearch": "검색 지우기",
	"api.useCustomBaseUrl": "사용자 정의 기본 URL 사용",
	"api.apiKey": "API 키",
	"api.apiKey.placeholder": "API 키 입력...",
	"api.apiKey.helpText": "이 키는 로컬에 저장되며 이 확장에서 API 요청을 보내는 데만 사용됩니다.",
	"api.apiKey.signupPrefix": "",
	"api.apiKey.signupSuffix": "API 키를 발급받으려면 여기에서 가입하세요.",
	"api.model": "모델",
	"api.model.selectPlaceholder": "모델을 선택하세요...",
	"api.model.searchPlaceholder": "모델 검색 및 선택...",
	"api.contextWindow": "모델 컨텍스트 윈도우",
	"api.requestTimeout": "요청 시간 제한 (ms)",
	"api.requestTimeout.description": "API 응답을 기다리는 최대 시간(밀리초)입니다.",
	"api.compactPrompt": "간결한 프롬프트 사용",
	"api.compactPrompt.description": "더 작은 컨텍스트 윈도우(예: 8k 이하)에 최적화된 시스템 프롬프트입니다.",
	"api.compactPrompt.noSupport": "MCP 및 포커스 체인을 지원하지 않습니다",
	"api.planActSeparate": "Plan 모드와 Act 모드에 다른 모델 사용",
	"api.planActSeparate.description":
		"Plan 모드와 Act 모드를 전환하면 이전 모드에서 사용한 API와 모델이 유지됩니다. 이는 강력한 추론 모델로 계획을 설계하고, 저렴한 코딩 모델로 실행할 때 유용합니다.",
	"api.planMode": "Plan 모드",
	"api.actMode": "Act 모드",
	"api.ollama.helpText": "인증된 Ollama 인스턴스 또는 클라우드 서비스를 위한 선택적 API 키입니다. 로컬 설치의 경우 비워두세요.",
	"api.ollama.apiKeyPlaceholder": "API 키 입력 (선택사항)...",
	"api.ollama.fetchError":
		"Ollama 서버에서 모델을 가져올 수 없습니다. Ollama가 실행 중이고 접근 가능한지 확인하거나, 위에서 모델 ID를 직접 입력하세요.",
	"api.ollama.description": "Ollama를 사용하면 로컬에서 모델을 실행할 수 있습니다. 시작 방법은",
	"api.ollama.quickstartGuide": "빠른 시작 가이드를",
	"api.ollama.note": "참고:",
	"api.ollama.noteText":
		"Cline은 복잡한 프롬프트를 사용하며 Claude 모델에서 가장 잘 작동합니다. 성능이 낮은 모델은 예상대로 작동하지 않을 수 있습니다.",

	// Features - MCP Display Mode
	"features.mcpDisplayMode.label": "MCP 표시 모드",
	"features.mcpDisplayMode.description": "MCP 응답 표시 방법을 제어합니다",
	"features.mcpDisplayMode.plainText": "일반 텍스트",
	"features.mcpDisplayMode.richDisplay": "리치 표시",
	"features.mcpDisplayMode.markdown": "마크다운",

	// Browser Settings
	"browser.disableToolUsage": "브라우저 도구 사용 비활성화",
	"browser.disableToolUsage.description": "Cline이 브라우저 작업(예: 실행, 클릭, 입력)을 사용하지 못하도록 합니다.",
	"browser.viewport.label": "뷰포트 크기",
	"browser.viewport.description": "스크린샷 및 상호작용을 위한 브라우저 뷰포트 크기를 설정합니다.",
	"browser.remoteBrowser.label": "원격 브라우저 연결 사용",
	"browser.chromePath.label": "Chrome 실행 파일 경로 (선택사항)",
	"browser.chromePath.autoDetect": "자동 감지하려면 비워두세요.",
	"browser.customArgs.label": "사용자 정의 브라우저 인수 (선택사항)",
	"browser.customArgs.description": "브라우저 실행 파일에 전달할 공백으로 구분된 인수입니다.",
	"browser.connection.checking": "연결 확인 중...",
	"browser.connection.connected": "연결됨",
	"browser.connection.notConnected": "연결되지 않음",
	"browser.launchDebugMode": "디버그 모드로 브라우저 실행",
	"browser.launchingBrowser": "브라우저 실행 중...",

	// Terminal Settings
	"terminal.defaultProfile": "기본 터미널 프로필",
	"terminal.defaultProfile.description": "Cline이 사용할 기본 터미널을 선택합니다. 'Default'는 VSCode 전역 설정을 사용합니다.",
	"terminal.shellTimeout": "셸 통합 시간 제한 (초)",
	"terminal.shellTimeout.placeholder": "시간 제한을 초 단위로 입력하세요",
	"terminal.shellTimeout.description":
		"명령 실행 전 셸 통합 활성화를 기다리는 시간을 설정합니다. 터미널 연결 시간 초과가 발생하면 이 값을 늘리세요.",
	"terminal.shellTimeout.error": "양수를 입력해 주세요",
	"terminal.aggressiveReuse": "적극적 터미널 재사용 활성화",
	"terminal.aggressiveReuse.description":
		"활성화하면 현재 작업 디렉토리에 없는 기존 터미널 창을 재사용합니다. 터미널 명령 후 작업 잠금 문제가 발생하면 비활성화하세요.",
	"terminal.executionMode": "터미널 실행 모드",
	"terminal.executionMode.vscode": "VS Code 터미널",
	"terminal.executionMode.background": "백그라운드 실행",
	"terminal.executionMode.description": "Cline이 VS Code 터미널에서 명령을 실행할지 백그라운드 프로세스로 실행할지 선택합니다.",
	"terminal.outputLimit": "터미널 출력 제한",
	"terminal.outputLimit.description":
		"명령 실행 시 터미널 출력에 포함할 최대 줄 수입니다. 초과 시 중간의 줄이 제거되어 토큰을 절약합니다.",
	"terminal.issues": "터미널 문제가 있나요?",
	"terminal.issues.checkOur": "다음을 확인하세요:",
	"terminal.issues.quickFixes": "터미널 빠른 수정",
	"terminal.issues.orThe": "또는",
	"terminal.issues.troubleshooting": "전체 문제 해결 가이드",

	// About
	"about.description":
		"CLI와 에디터를 사용할 수 있는 AI 어시스턴트입니다. Cline은 파일 생성 및 편집, 대규모 프로젝트 탐색, 브라우저 사용, 터미널 명령 실행(권한 부여 후) 등의 도구를 통해 복잡한 소프트웨어 개발 작업을 단계별로 처리할 수 있습니다.",
	"about.community": "커뮤니티 & 지원",
	"about.development": "개발",
	"about.featureRequests": "기능 요청",
	"about.resources": "리소스",
	"about.documentation": "문서",

	// Chat
	"chat.placeholder": "메시지를 입력하세요...",
	"chat.messagePlaceholder": "메시지를 입력하세요...",
	"chat.taskPlaceholder": "작업을 입력하세요...",
	"chat.inputHint": "@ 컨텍스트 추가, / 슬래시 명령어 & 워크플로우, shift를 누른 채로 파일/이미지 드래그",
	"chat.send": "전송",

	// History
	"history.title": "기록",
	"history.noHistory": "기록이 없습니다",
	"history.searchPlaceholder": "기록 검색...",
	"history.deleteAll": "전체 기록 삭제",
	"history.sortBy": "정렬 기준",
	"history.today": "오늘",
	"history.older": "이전",
	"history.selectAll": "전체 선택",
	"history.selectNone": "선택 해제",
	"history.deleteSelected": "삭제",
	"history.selected": "개 선택됨",
	"history.filter.newest": "최신순",
	"history.filter.oldest": "오래된순",
	"history.filter.mostExpensive": "비용순",
	"history.filter.mostTokens": "토큰순",
	"history.filter.mostRelevant": "관련도순",
	"history.filter.workspaceOnly": "워크스페이스만",
	"history.filter.favoritesOnly": "즐겨찾기만",
	"common.done": "완료",

	// Account
	"account.title": "계정",
	"account.signupDescription":
		"계정을 등록하면 최신 모델, 사용량 및 크레딧을 확인할 수 있는 빌링 대시보드, 그리고 더 많은 기능을 이용할 수 있습니다.",
	"account.signupButton": "Cline으로 가입하기",
	"account.agreementPrefix": "계속 진행하면",
	"account.termsOfService": "서비스 약관",
	"account.and": "및",
	"account.privacyPolicy": "개인정보 처리방침",

	// Rules / Workflows / Hooks / Skills
	"rules.tab.rules": "규칙",
	"rules.tab.workflows": "워크플로우",
	"rules.tab.hooks": "훅",
	"rules.tab.skills": "스킬",
	"rules.description":
		"규칙을 통해 Cline에 시스템 수준의 지침을 제공할 수 있습니다. 프로젝트별 또는 모든 대화에 대해 글로벌로 컨텍스트와 설정을 지속적으로 포함하는 방법으로 생각하세요.",
	"rules.workflows.description":
		"워크플로우를 사용하면 서비스 배포나 PR 제출과 같은 반복 작업을 Cline에게 안내하는 일련의 단계를 정의할 수 있습니다. 워크플로우를 실행하려면 채팅에서",
	"rules.workflows.invoke": "을 입력하세요.",
	"rules.skills.description":
		"스킬은 Cline이 필요에 따라 활성화할 수 있는 재사용 가능한 지침 세트입니다. 작업이 스킬의 설명과 일치하면 Cline은",
	"rules.skills.tool": "도구를 사용하여 전체 지침을 로드합니다.",
	"rules.hooks.description":
		"훅을 사용하면 Cline의 실행 라이프사이클의 특정 지점에서 사용자 정의 스크립트를 실행하여 자동화 및 외부 도구와의 통합을 가능하게 합니다.",
	"rules.docs": "문서",
	"rules.global": "글로벌 규칙",
	"rules.workspace": "워크스페이스 규칙",
	"rules.globalWorkflows": "글로벌 워크플로우",
	"rules.workspaceWorkflows": "워크스페이스 워크플로우",
	"rules.globalHooks": "글로벌 훅",
	"rules.globalSkills": "글로벌 스킬",
	"rules.workspaceSkills": "워크스페이스 스킬",
	"rules.enterpriseRules": "엔터프라이즈 규칙",
	"rules.enterpriseWorkflows": "엔터프라이즈 워크플로우",
	"rules.remoteRules": "조직에서 일부 규칙을 관리합니다",
	"rules.remoteWorkflows": "조직에서 일부 워크플로우를 관리합니다",

	// Welcome / Onboarding
	"welcome.title": "Cline에 오신 것을 환영합니다",
	"welcome.getStarted": "시작하기",
	"welcome.subtitle": "자율형 AI 코딩 에이전트",
	"welcome.whatCanIDo": "무엇을 도와드릴까요?",
	"welcome.takeATour": "둘러보기",

	// Action Buttons (buttonConfig)
	"buttons.retry": "재시도",
	"buttons.startNewTask": "새 작업 시작",
	"buttons.startNewTaskWithContext": "컨텍스트와 함께 새 작업 시작",
	"buttons.proceedAnyways": "계속 진행",
	"buttons.approve": "승인",
	"buttons.reject": "거부",
	"buttons.save": "저장",
	"buttons.runCommand": "명령 실행",
	"buttons.proceedWhileRunning": "실행 중 계속 진행",
	"buttons.resumeTask": "작업 재개",
	"buttons.condenseConversation": "대화 압축",
	"buttons.reportGitHubIssue": "GitHub 이슈 보고",
	"buttons.cancel": "취소",

	// History Preview
	"historyPreview.recent": "최근",
	"historyPreview.viewAll": "전체 보기",
	"historyPreview.viewAllAriaLabel": "전체 기록 보기",
	"historyPreview.favoritedAriaLabel": "즐겨찾기",
	"historyPreview.noRecentTasks": "최근 작업이 없습니다",

	// MCP Configuration View
	"mcp.title": "MCP 서버",
	"mcp.tab.marketplace": "마켓플레이스",
	"mcp.tab.remoteServers": "원격 서버",
	"mcp.tab.configure": "설정",

	// MCP Server Row
	"mcp.server.restart": "서버 재시작",
	"mcp.server.restarting": "재시작 중...",
	"mcp.server.delete": "서버 삭제",
	"mcp.server.deleting": "삭제 중...",
	"mcp.server.retryConnection": "연결 재시도",
	"mcp.server.retrying": "재시도 중...",
	"mcp.server.tabs.tools": "도구",
	"mcp.server.tabs.resources": "리소스",
	"mcp.server.tabs.prompts": "프롬프트",
	"mcp.server.autoApproveAll": "모든 도구 자동 승인",
	"mcp.server.noTools": "도구를 찾을 수 없습니다",
	"mcp.server.noResources": "리소스를 찾을 수 없습니다",
	"mcp.server.noPrompts": "프롬프트를 찾을 수 없습니다",
	"mcp.server.requestTimeout": "요청 시간 초과",
	"mcp.server.alwaysEnabled": "이 서버는 조직에서 활성화했기 때문에 비활성화할 수 없습니다",
	"mcp.server.authenticate": "인증",
	"mcp.tool.autoApprove": "자동 승인",
	"mcp.tool.parameters": "파라미터",
	"mcp.tool.noDescription": "설명 없음",
	"mcp.resource.returns": "반환:",
	"mcp.resource.noDescription": "설명 없음",
	"mcp.prompt.arguments": "인수",
	"mcp.prompt.noDescription": "설명 없음",

	// MCP Configure View
	"mcp.configure.remoteManaged": "조직에서 일부 MCP 서버를 관리하고 있습니다",
	"mcp.configure.openSettings": "MCP 서버 설정",
	"mcp.configure.advancedSettings": "고급 MCP 설정",
	"mcp.noServersInstalled": "설치된 MCP 서버가 없습니다",

	// MCP Timeout Options
	"mcp.timeout.30s": "30초",
	"mcp.timeout.1m": "1분",
	"mcp.timeout.5m": "5분",
	"mcp.timeout.10m": "10분",
	"mcp.timeout.30m": "30분",
	"mcp.timeout.1h": "1시간",

	// MCP Marketplace
	"mcp.marketplace.loadError": "마켓플레이스 데이터를 불러오지 못했습니다",
	"mcp.marketplace.retry": "재시도",
	"mcp.marketplace.searchPlaceholder": "MCP 검색...",
	"mcp.marketplace.clearSearch": "검색 지우기",
	"mcp.marketplace.filter": "필터:",
	"mcp.marketplace.allCategories": "전체 카테고리",
	"mcp.marketplace.sort": "정렬:",
	"mcp.marketplace.sortMostInstalls": "많이 설치된",
	"mcp.marketplace.sortNewest": "최신순",
	"mcp.marketplace.sortStars": "GitHub 별",
	"mcp.marketplace.sortName": "이름순",
	"mcp.marketplace.orgPreconfigured": "조직에서 사용 가능한 MCP 서버를 사전 구성했습니다",
	"mcp.marketplace.noMatchingServers": "일치하는 MCP 서버를 찾을 수 없습니다",
	"mcp.marketplace.noServers": "마켓플레이스에서 MCP 서버를 찾을 수 없습니다",
	"mcp.marketplace.install": "설치",
	"mcp.marketplace.installing": "설치 중...",
	"mcp.marketplace.installed": "설치됨",
	"mcp.marketplace.requiresApiKey": "API 키 필요",
	"mcp.marketplace.submit": "MCP 서버 제출",
	"mcp.marketplace.submitDescription": "이슈를 제출하여 훌륭한 MCP 서버를 다른 사람들이 발견할 수 있도록 도와주세요.",

	// MCP Add Remote Server
	"mcp.addRemote.serverNameRequired": "서버 이름이 필요합니다",
	"mcp.addRemote.serverUrlRequired": "서버 URL이 필요합니다",
	"mcp.addRemote.invalidUrl": "유효하지 않은 URL 형식입니다",
	"mcp.addRemote.failedToAdd": "서버 추가에 실패했습니다",
	"mcp.addRemote.serverName": "서버 이름",
	"mcp.addRemote.serverUrl": "서버 URL",
	"mcp.addRemote.transportType": "전송 방식",
	"mcp.addRemote.connecting": "연결 중...",
	"mcp.addRemote.addServer": "서버 추가",
	"mcp.addRemote.editConfig": "설정 편집",
	"mcp.addRemote.learnMore": "자세히 보기",
	"mcp.addRemote.description": "이름과 URL 엔드포인트를 입력하여 원격 MCP 서버를 추가하세요.",

	// MCP Add Local Server
	"mcp.addLocal.openSettings": "cline_mcp_settings.json 열기",
	"mcp.addLocal.learnMore": "자세히 보기",

	// MCP Display Mode
	"mcp.displayMode.plainText": "일반 텍스트",
	"mcp.displayMode.richDisplay": "리치 디스플레이",
	"mcp.displayMode.markdown": "마크다운",

	// MCP Response Display
	"mcp.response.response": "응답",
	"mcp.response.responseError": "응답 (오류)",
	"mcp.response.parseError": "응답 파싱 오류:",

	// Focus Chain
	"focusChain.completed": "모든 작업이 완료되었습니다!",
	"focusChain.label": "할 일 목록",
	"focusChain.newSteps": "작업을 계속하면 새 단계가 생성됩니다",
	"focusChain.clickToEdit": "클릭하여 파일에서 할 일 목록 편집",
	"focusChain.collapse": "포커스 체인 접기",
	"focusChain.expand": "포커스 체인 펼치기",

	// Browser Session
	"browser.sessionStarted": "브라우저 세션 시작됨",
	"browser.usingBrowser": "Cline이 브라우저를 사용 중입니다:",
	"browser.wantsBrowser": "Cline이 브라우저를 사용하려고 합니다:",
	"browser.step": "단계",
	"browser.consoleLogs": "콘솔 로그",
	"browser.noNewLogs": "(새 로그 없음)",
	"browser.previous": "이전",
	"browser.next": "다음",
	"browser.screenshotAlt": "브라우저 스크린샷",
	"browser.action.label": "브라우저 동작:",
	"browser.action.launchPrefix": "브라우저 시작:",
	"browser.action.clickPrefix": "클릭",
	"browser.action.typePrefix": "입력",
	"browser.action.scrollDown": "아래로 스크롤",
	"browser.action.scrollUp": "위로 스크롤",
	"browser.action.close": "브라우저 닫기",

	// Errors
	"error.loggedOut": "로그아웃된 것 같습니다 \u2013 아래를 클릭하여 로그인하세요",
	"error.signIn": "Cline에 로그인",
	"error.clickRetry": '(아래의 "재시도"를 클릭하세요)',
	"error.powershellPrefix": "Windows PowerShell 문제가 발생한 것 같습니다.",
	"error.powershellLink": "문제 해결 가이드",
	"error.powershellSuffix": "를 참조하세요.",
	"error.diffError": "모델이 파일에서 일치하는 검색 패턴을 찾지 못했습니다. 재시도 중...",
	"error.clineignorePrefix": "Cline이",
	"error.clineignoreSuffix": "에 접근하려 했지만 .clineignore 파일에 의해 차단되었습니다.",

	// Credit Limit Error
	"creditLimit.currentBalance": "현재 잔액:",
	"creditLimit.totalSpent": "총 사용액:",
	"creditLimit.totalPromotions": "총 프로모션:",
	"creditLimit.buyCredits": "크레딧 구매",
	"creditLimit.retryRequest": "요청 재시도",

	// Common UI
	"common.copy": "복사",
	"common.copied": "복사됨",
	"common.quoteSelection": "선택 항목 인용",
	"common.quoteSelectionInReply": "답변에서 선택 항목 인용",

	// Alert Dialog
	"dialog.unsavedChanges.title": "저장되지 않은 변경사항",
	"dialog.unsavedChanges.description": "저장되지 않은 변경사항이 있습니다. 정말 삭제하시겠습니까?",
	"dialog.unsavedChanges.confirm": "변경사항 삭제",
	"dialog.unsavedChanges.save": "저장 후 계속",
	"dialog.cancel": "취소",

	// Slash Command Menu
	"slashMenu.defaultCommands": "기본 명령어",
	"slashMenu.workflowCommands": "워크플로우 명령어",
	"slashMenu.mcpPrompts": "MCP 프롬프트",
	"slashMenu.noResults": "일치하는 명령어를 찾을 수 없습니다",
	"slashMenu.ariaLabel": "슬래시 명령어",

	// Context Menu
	"contextMenu.problems": "문제",
	"contextMenu.terminal": "터미널",
	"contextMenu.pasteUrl": "URL을 붙여넣어 내용 가져오기",
	"contextMenu.noResults": "결과를 찾을 수 없습니다",
	"contextMenu.gitCommits": "Git 커밋",
	"contextMenu.addFile": "파일 추가",
	"contextMenu.addFolder": "폴더 추가",

	// Thinking Row
	"thinking.title": "생각 중",

	// Hook Message
	"hook.label": "훅:",
	"hook.status.running": "실행 중",
	"hook.status.failed": "실패",
	"hook.status.aborted": "중단됨",
	"hook.status.completed": "완료됨",
	"hook.status.unknown": "알 수 없음",
	"hook.abort": "중단",
	"hook.timeout": "30초를 초과했습니다. 무한 루프가 있는지 확인하거나 네트워크 요청에 타임아웃을 추가하세요.",
	"hook.invalidJson": "훅이 유효하지 않은 JSON을 반환했습니다. 자세한 내용은 아래 오류 세부 정보를 확인하세요.",

	// Task Feedback
	"feedback.helpful": "도움이 됐습니다",
	"feedback.notHelpful": "도움이 되지 않았습니다",

	// User Message (Checkpoints)
	"checkpoint.restoreAll": "모두 복원",
	"checkpoint.restoreAllTitle": "채팅과 작업공간 파일을 이 체크포인트로 복원하고 수정된 메시지를 전송합니다",
	"checkpoint.restoreChat": "채팅 복원",
	"checkpoint.restoreChatTitle": "채팅만 이 체크포인트로 복원하고 수정된 메시지를 전송합니다",

	// MCP Server Toggle Modal
	"mcpModal.manage": "MCP 서버 관리",
	"mcpModal.hide": "MCP 서버 숨기기",
	"mcpModal.show": "MCP 서버 표시",
	"mcpModal.title": "MCP 서버",
	"mcpModal.goToSettings": "MCP 서버 설정으로 이동",

	// Telemetry Banner
	"telemetry.banner.title": "Cline 개선에 도움을 주세요",
	"telemetry.banner.subtitle": "(그리고 실험적 기능에 접근하세요)",
	"telemetry.banner.description":
		"Cline은 버그 수정과 확장 기능 개선을 위해 오류 및 사용 데이터를 수집합니다. 코드, 프롬프트, 개인 정보는 전송되지 않습니다.",
	"telemetry.banner.turnOffPrefix": "이 설정은 ",
	"telemetry.banner.settings": "설정",
	"telemetry.banner.turnOffSuffix": "에서 끌 수 있습니다.",
	"telemetry.banner.closeAriaLabel": "배너 닫기 및 원격 분석 활성화",

	// Feature Tips
	"featureTip.label": "팁:",
	"featureTip.0": '설정에서 "완료 재확인"을 활성화하면 Cline이 작업을 마치기 전에 결과를 검토합니다.',
	"featureTip.1": "프로젝트 루트에 .clinerules 파일을 추가하면 Cline에게 프로젝트별 지침을 제공할 수 있습니다.",
	"featureTip.2": "Plan 모드로 전환하면 Cline이 실행하기 전에 접근 방식을 논의하고 계획할 수 있습니다.",
	"featureTip.3": "채팅 입력창에서 @를 사용하면 파일, 폴더, URL을 작업의 컨텍스트로 추가할 수 있습니다.",
	"featureTip.4": "MCP 서버를 설정하면 Cline에게 외부 도구와 API 접근 권한을 부여할 수 있습니다.",
	"featureTip.5": "Cline은 변경 후 체크포인트를 생성합니다 \u2014 언제든지 이전 상태로 복원할 수 있습니다.",
	"featureTip.6": "/compact를 사용하면 긴 대화를 압축하여 컨텍스트 창 공간을 확보할 수 있습니다.",
	"featureTip.7": "파일 읽기와 같은 읽기 전용 도구에 자동 승인을 활성화하면 탐색 속도가 빨라집니다.",
	"featureTip.8": "인용 버튼을 사용하면 Cline의 응답에서 텍스트를 선택해 답변에 참조할 수 있습니다.",
	"featureTip.9": "채팅창에 이미지를 드래그 앤 드롭하면 Cline과 스크린샷을 공유할 수 있습니다.",
	"featureTip.10": "Cline은 웹사이트를 탐색할 수 있습니다 \u2014 브라우저에서 로컬 개발 서버를 테스트해보세요.",
	"featureTip.11": "/reportbug를 사용하면 진단 컨텍스트가 포함된 GitHub 이슈를 빠르게 제출할 수 있습니다.",

	// What's New Modal
	"whatsNew.title": "v{version} 새 기능",
	"whatsNew.supportText": "Cline을 지원해주세요",
	"whatsNew.githubStar": "GitHub에서 스타 눌러주기",
	"whatsNew.followOnX": "X에서 팔로우하기",
	"whatsNew.joinDiscord": "Discord 참여하기",
	"whatsNew.starOnGitHub": "GitHub에서 스타 누르기",
	"whatsNew.joinSubreddit": "서브레딧 참여하기",
	"whatsNew.followOnLinkedIn": "LinkedIn에서 팔로우하기",

	// Cline Model Picker
	"clineModelPicker.model": "모델",
	"clineModelPicker.recommended": "추천",
	"clineModelPicker.free": "무료",
	"clineModelPicker.searchPlaceholder": "모델 검색 및 선택...",
	"clineModelPicker.clearSearch": "검색 지우기",

	// Markdown Block
	"markdown.toggleActMode": "클릭하여 Act 모드로 전환",
	"markdown.alreadyActMode": "이미 Act 모드입니다",
	"markdown.actModeLabel": "Act 모드 (\u2318\u21E7A)",
}

export default ko
