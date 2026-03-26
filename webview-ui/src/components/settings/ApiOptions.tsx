// ============================================================
// ApiOptions.tsx
// API 프로바이더 선택 및 설정 컴포넌트
//
// 역할:
//   - 사용자가 사용할 AI API 프로바이더(Anthropic, Ollama, OpenRouter 등)를
//     검색/선택할 수 있는 드롭다운 UI를 제공합니다.
//   - 선택된 프로바이더에 따라 해당 프로바이더 전용 설정 컴포넌트를 조건부 렌더링합니다.
//   - Plan 모드와 Act 모드 각각에 독립적인 프로바이더 설정을 지원합니다.
// ============================================================

import { StringRequest } from "@shared/proto/cline/common"
import PROVIDERS from "@shared/providers/providers.json"
import { Mode } from "@shared/storage/types"
import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react"
import Fuse from "fuse.js"
import { KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useInterval } from "react-use"
import styled from "styled-components"
import { normalizeApiConfiguration } from "@/components/settings/utils/providerUtils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { PLATFORM_CONFIG, PlatformType } from "@/config/platform.config"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { useTranslation } from "@/i18n/useTranslation"
import { ModelsServiceClient } from "@/services/grpc-client"
import { OPENROUTER_MODEL_PICKER_Z_INDEX } from "./OpenRouterModelPicker"
// 각 프로바이더 전용 설정 컴포넌트 임포트
import { AIhubmixProvider } from "./providers/AihubmixProvider"
import { AnthropicProvider } from "./providers/AnthropicProvider"
import { AskSageProvider } from "./providers/AskSageProvider"
import { BasetenProvider } from "./providers/BasetenProvider"
import { BedrockProvider } from "./providers/BedrockProvider"
import { CerebrasProvider } from "./providers/CerebrasProvider"
import { ClaudeCodeProvider } from "./providers/ClaudeCodeProvider"
import { ClineProvider } from "./providers/ClineProvider"
import { DeepSeekProvider } from "./providers/DeepSeekProvider"
import { DifyProvider } from "./providers/DifyProvider"
import { DoubaoProvider } from "./providers/DoubaoProvider"
import { FireworksProvider } from "./providers/FireworksProvider"
import { GeminiProvider } from "./providers/GeminiProvider"
import { GroqProvider } from "./providers/GroqProvider"
import { HicapProvider } from "./providers/HicapProvider"
import { HuaweiCloudMaasProvider } from "./providers/HuaweiCloudMaasProvider"
import { HuggingFaceProvider } from "./providers/HuggingFaceProvider"
import { LiteLlmProvider } from "./providers/LiteLlmProvider"
import { LMStudioProvider } from "./providers/LMStudioProvider"
import { MinimaxProvider } from "./providers/MiniMaxProvider"
import { MistralProvider } from "./providers/MistralProvider"
import { MoonshotProvider } from "./providers/MoonshotProvider"
import { NebiusProvider } from "./providers/NebiusProvider"
import { NousResearchProvider } from "./providers/NousresearchProvider"
import { OcaProvider } from "./providers/OcaProvider"
import { OllamaProvider } from "./providers/OllamaProvider"
import { OpenAICompatibleProvider } from "./providers/OpenAICompatible"
import { OpenAINativeProvider } from "./providers/OpenAINative"
import { OpenAiCodexProvider } from "./providers/OpenAiCodexProvider"
import { OpenRouterProvider } from "./providers/OpenRouterProvider"
import { QwenCodeProvider } from "./providers/QwenCodeProvider"
import { QwenProvider } from "./providers/QwenProvider"
import { RequestyProvider } from "./providers/RequestyProvider"
import { SambanovaProvider } from "./providers/SambanovaProvider"
import { SapAiCoreProvider } from "./providers/SapAiCoreProvider"
import { TogetherProvider } from "./providers/TogetherProvider"
import { VercelAIGatewayProvider } from "./providers/VercelAIGatewayProvider"
import { VertexProvider } from "./providers/VertexProvider"
import { VSCodeLmProvider } from "./providers/VSCodeLmProvider"
import { WandbProvider } from "./providers/WandbProvider"
import { XaiProvider } from "./providers/XaiProvider"
import { ZAiProvider } from "./providers/ZAiProvider"
import { useApiConfigurationHandlers } from "./utils/useApiConfigurationHandlers"

// ============================================================
// Props 인터페이스 정의
// ============================================================
interface ApiOptionsProps {
	/** 모델 선택 옵션 표시 여부 */
	showModelOptions: boolean
	/** API 키 오류 등 API 수준 에러 메시지 */
	apiErrorMessage?: string
	/** 모델 ID 관련 에러 메시지 */
	modelIdErrorMessage?: string
	/** 팝업(모달) 내부에서 렌더링되는지 여부 (레이아웃 조정에 사용) */
	isPopup?: boolean
	/** 현재 활성 모드 (Plan 또는 Act) */
	currentMode: Mode
	/** 모델 탭 초기 선택값 ("recommended" | "free") */
	initialModelTab?: "recommended" | "free"
}

// ============================================================
// z-index 상수 정의
//
// 드롭다운이 항상 아래 방향으로 열리도록 보장하기 위해 필요합니다.
// OpenRouterModelPicker 및 ModelSelectorTooltip보다 높은 z-index를 사용합니다.
// ============================================================
export const DROPDOWN_Z_INDEX = OPENROUTER_MODEL_PICKER_Z_INDEX + 2

// 드롭다운이 항상 아래 방향으로 열리도록 강제하는 컨테이너 스타일 컴포넌트
export const DropdownContainer = styled.div<{ zIndex?: number }>`
	position: relative;
	z-index: ${(props) => props.zIndex || DROPDOWN_Z_INDEX};

	// vscode-dropdown 내부 listbox가 항상 아래쪽에 표시되도록 강제
	& vscode-dropdown::part(listbox) {
		position: absolute !important;
		top: 100% !important;
		bottom: auto !important;
	}
`

// VS Code 확장의 LanguageModelChatSelector 타입에 추가 필드 선언
declare module "vscode" {
	interface LanguageModelChatSelector {
		vendor?: string
		family?: string
		version?: string
		id?: string
	}
}

// ============================================================
// ApiOptions 컴포넌트 본체
// ============================================================
const ApiOptions = ({
	showModelOptions,
	apiErrorMessage,
	modelIdErrorMessage,
	isPopup,
	currentMode,
	initialModelTab,
}: ApiOptionsProps) => {
	// 전체 확장 상태에서 API 설정 및 원격 설정을 가져옴
	// - apiConfiguration: 현재 저장된 API 키, 모델 ID, 프로바이더 등의 설정
	// - remoteConfigSettings: 조직 레벨의 원격 설정 (사용 가능한 프로바이더 제한 등)
	const { apiConfiguration, remoteConfigSettings } = useExtensionState()
	const { t } = useTranslation()

	// 현재 모드(Plan/Act)에 따른 선택된 프로바이더 식별자를 정규화하여 추출
	// 예: "anthropic", "ollama", "openrouter" 등
	const { selectedProvider } = normalizeApiConfiguration(apiConfiguration, currentMode)

	// 모드별 필드 변경 핸들러 (Plan 모드: planModeApiProvider, Act 모드: actModeApiProvider)
	const { handleModeFieldChange } = useApiConfigurationHandlers()

	// Ollama 로컬 모델 목록 상태 (현재 UI에서 직접 사용되지 않고 OllamaProvider로 전달됨)
	const [_ollamaModels, setOllamaModels] = useState<string[]>([])

	// ============================================================
	// Ollama 모델 폴링
	//
	// Ollama는 로컬에서 실행되는 LLM 서버이므로
	// 현재 실행 중인 모델 목록을 주기적으로 가져와야 합니다.
	// selectedProvider가 "ollama"일 때만 2초 간격으로 폴링합니다.
	// ============================================================
	const requestLocalModels = useCallback(async () => {
		if (selectedProvider === "ollama") {
			try {
				// gRPC를 통해 Ollama 서버에서 사용 가능한 모델 목록 요청
				const response = await ModelsServiceClient.getOllamaModels(
					StringRequest.create({
						value: apiConfiguration?.ollamaBaseUrl || "",
					}),
				)
				if (response && response.values) {
					setOllamaModels(response.values)
				}
			} catch (error) {
				console.error("Failed to fetch Ollama models:", error)
				setOllamaModels([])
			}
		}
	}, [selectedProvider, apiConfiguration?.ollamaBaseUrl])

	// 프로바이더가 Ollama로 변경될 때 즉시 한 번 모델 목록을 가져옴
	useEffect(() => {
		if (selectedProvider === "ollama") {
			requestLocalModels()
		}
	}, [selectedProvider, requestLocalModels])

	// Ollama 선택 시 2초마다 모델 목록 갱신, 다른 프로바이더면 폴링 중단(null)
	useInterval(requestLocalModels, selectedProvider === "ollama" ? 2000 : null)

	// ============================================================
	// 프로바이더 검색 드롭다운 상태 관리
	// ============================================================

	/** 검색 입력 필드에 사용자가 입력한 텍스트 */
	const [searchTerm, setSearchTerm] = useState("")
	/** 드롭다운 목록의 표시 여부 */
	const [isDropdownVisible, setIsDropdownVisible] = useState(false)
	/** 키보드 방향키로 이동 중인 항목의 인덱스 (-1: 선택 없음) */
	const [selectedIndex, setSelectedIndex] = useState(-1)
	/** 드롭다운 전체 컨테이너 ref (외부 클릭 감지용) */
	const dropdownRef = useRef<HTMLDivElement>(null)
	/** 각 드롭다운 항목의 DOM ref 배열 (키보드 스크롤용) */
	const itemRefs = useRef<(HTMLDivElement | null)[]>([])
	/** 드롭다운 목록 스크롤 컨테이너 ref */
	const dropdownListRef = useRef<HTMLDivElement>(null)

	// ============================================================
	// 프로바이더 옵션 목록 계산 (메모이제이션)
	//
	// 1. 플랫폼 필터링: VS Code가 아닌 환경에서는 "vscode-lm" 제외
	// 2. 원격 설정 필터링: 조직 원격 설정에서 허용된 프로바이더만 표시
	// ============================================================
	const providerOptions = useMemo(() => {
		let providers = PROVIDERS.list

		// VS Code가 아닌 플랫폼(JetBrains, CLI 등)에서는 VS Code Language Model API 제외
		if (PLATFORM_CONFIG.type !== PlatformType.VSCODE) {
			providers = providers.filter((option) => option.value !== "vscode-lm")
		}

		// 조직 원격 설정에서 허용 프로바이더 목록이 지정된 경우 해당 목록으로 제한
		const remoteProviders: string[] = remoteConfigSettings?.remoteConfiguredProviders || []
		if (remoteProviders.length > 0) {
			providers = providers.filter((option) => remoteProviders.includes(option.value))
		}

		return providers
	}, [remoteConfigSettings])

	// 현재 선택된 프로바이더의 표시 레이블 (예: "anthropic" → "Anthropic")
	const currentProviderLabel = useMemo(() => {
		return providerOptions.find((option) => option.value === selectedProvider)?.label || selectedProvider
	}, [providerOptions, selectedProvider])

	// 드롭다운이 닫힌 상태일 때 검색어를 현재 프로바이더 레이블로 동기화
	// (검색 후 선택하지 않고 닫으면 원래 프로바이더 이름으로 복원)
	useEffect(() => {
		if (!isDropdownVisible) {
			setSearchTerm(currentProviderLabel)
		}
	}, [currentProviderLabel, isDropdownVisible])

	// Fuse.js 퍼지 검색을 위한 검색 대상 데이터 변환 (value, html 형태)
	const searchableItems = useMemo(() => {
		return providerOptions.map((option) => ({
			value: option.value,
			html: option.label,
		}))
	}, [providerOptions])

	// ============================================================
	// Fuse.js 퍼지(유사) 검색 엔진 초기화
	//
	// - keys: 검색 대상 필드 (프로바이더 레이블)
	// - threshold: 0.3 = 약간의 오타도 허용 (0: 완전 일치, 1: 모두 허용)
	// - shouldSort: 관련성 높은 결과 먼저 정렬
	// - isCaseSensitive: 대소문자 구분 없음
	// - minMatchCharLength: 최소 1글자부터 검색
	// ============================================================
	const fuse = useMemo(() => {
		return new Fuse(searchableItems, {
			keys: ["html"],
			threshold: 0.3,
			shouldSort: true,
			isCaseSensitive: false,
			ignoreLocation: false,
			includeMatches: true,
			minMatchCharLength: 1,
		})
	}, [searchableItems])

	// 검색어에 따른 필터링 결과
	// - 검색어가 없거나 현재 프로바이더 레이블과 동일하면 전체 목록 표시
	// - 검색어가 있으면 Fuse.js로 퍼지 검색 수행
	const providerSearchResults = useMemo(() => {
		return searchTerm && searchTerm !== currentProviderLabel ? fuse.search(searchTerm)?.map((r) => r.item) : searchableItems
	}, [searchableItems, searchTerm, fuse, currentProviderLabel])

	// ============================================================
	// 프로바이더 변경 핸들러
	//
	// Plan/Act 모드에 따라 다른 상태 키를 업데이트합니다.
	// 선택 후 드롭다운을 닫고 키보드 선택 인덱스를 초기화합니다.
	// ============================================================
	const handleProviderChange = (newProvider: string) => {
		handleModeFieldChange({ plan: "planModeApiProvider", act: "actModeApiProvider" }, newProvider as any, currentMode)
		setIsDropdownVisible(false)
		setSelectedIndex(-1)
	}

	// ============================================================
	// 키보드 탐색 핸들러
	//
	// - ArrowDown/ArrowUp: 목록 항목 이동
	// - Enter: 현재 선택된 항목 선택 확정
	// - Escape: 드롭다운 닫기 및 검색어 초기화
	// ============================================================
	const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
		if (!isDropdownVisible) {
			return
		}

		switch (event.key) {
			case "ArrowDown":
				event.preventDefault()
				// 마지막 항목 이후로는 이동하지 않음
				setSelectedIndex((prev) => (prev < providerSearchResults.length - 1 ? prev + 1 : prev))
				break
			case "ArrowUp":
				event.preventDefault()
				// 첫 번째 항목 이전으로는 이동하지 않음
				setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev))
				break
			case "Enter":
				event.preventDefault()
				if (selectedIndex >= 0 && selectedIndex < providerSearchResults.length) {
					handleProviderChange(providerSearchResults[selectedIndex].value)
				}
				break
			case "Escape":
				// 드롭다운 닫기 및 원래 프로바이더 레이블로 검색어 복원
				setIsDropdownVisible(false)
				setSelectedIndex(-1)
				setSearchTerm(currentProviderLabel)
				break
		}
	}

	// ============================================================
	// 드롭다운 외부 클릭 감지
	//
	// 드롭다운 영역 바깥을 클릭하면 드롭다운을 닫고
	// 검색어를 현재 프로바이더 레이블로 복원합니다.
	// ============================================================
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsDropdownVisible(false)
				setSearchTerm(currentProviderLabel)
			}
		}

		document.addEventListener("mousedown", handleClickOutside)
		return () => {
			document.removeEventListener("mousedown", handleClickOutside)
		}
	}, [currentProviderLabel])

	// 검색어가 변경될 때마다 키보드 선택 인덱스 초기화 및 스크롤 위치 초기화
	useEffect(() => {
		setSelectedIndex(-1)
		if (dropdownListRef.current) {
			dropdownListRef.current.scrollTop = 0
		}
	}, [searchTerm])

	// 키보드로 선택된 항목이 화면에 보이도록 자동 스크롤
	useEffect(() => {
		if (selectedIndex >= 0 && itemRefs.current[selectedIndex]) {
			itemRefs.current[selectedIndex]?.scrollIntoView({
				block: "nearest",
				behavior: "smooth",
			})
		}
	}, [selectedIndex])

	/*
	VSCodeDropdown 버그 우회 처리:
	VSCodeDropdown은 동적으로 렌더링된 옵션에서 제공된 value prop을 자동 선택하지 않는 알려진 버그가 있습니다.
	(참고: https://github.com/microsoft/vscode-webview-ui-toolkit/issues/433)

	우리 케이스에서는 사용자가 프로바이더를 전환할 때 선택된 모델 ID를 재계산하는데,
	VSCodeDropdown이 이 계산된 값을 반영하지 못하고 첫 번째 "Select a model..." 옵션으로
	기본값이 되어버려 마치 모델이 초기화된 것처럼 보이는 문제가 발생합니다.

	해결책: 각 프로바이더마다 별도의 드롭다운 인스턴스를 생성하고
	현재 프로바이더와 일치하는 것만 조건부 렌더링합니다.
	*/

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: isPopup ? -10 : 0 }}>
			{/* 검색 하이라이트 스타일: Fuse.js 매칭 결과에 배경색 적용 */}
			<style>
				{`
				.provider-item-highlight {
					background-color: var(--vscode-editor-findMatchHighlightBackground);
					color: inherit;
				}
				`}
			</style>

			{/* ============================================================
			    프로바이더 선택 드롭다운 영역
			    - 원격 설정으로 프로바이더가 제한된 경우 잠금 아이콘과 툴팁 표시
			    - 일반 경우 단순 레이블 표시
			    ============================================================ */}
			<DropdownContainer className="dropdown-container">
				{remoteConfigSettings?.remoteConfiguredProviders && remoteConfigSettings.remoteConfiguredProviders.length > 0 ? (
					// 조직 원격 설정으로 프로바이더가 제한된 경우: 잠금 아이콘 + 툴팁
					<Tooltip>
						<TooltipTrigger>
							<div className="flex items-center gap-2 mb-1">
								<label htmlFor="api-provider">
									<span style={{ fontWeight: 500 }}>{t("api.provider")}</span>
								</label>
								<i className="codicon codicon-lock text-description text-sm" />
							</div>
						</TooltipTrigger>
						<TooltipContent>{t("api.provider.remoteManaged")}</TooltipContent>
					</Tooltip>
				) : (
					// 일반 레이블
					<label htmlFor="api-provider">
						<span style={{ fontWeight: 500 }}>{t("api.provider")}</span>
					</label>
				)}

				{/* 검색 가능한 프로바이더 드롭다운 */}
				<ProviderDropdownWrapper ref={dropdownRef}>
					{/* 검색 입력 필드 */}
					<VSCodeTextField
						data-testid="provider-selector-input"
						id="api-provider"
						onFocus={() => {
							// 포커스 시 드롭다운 열기 및 검색어 초기화 (전체 목록 표시)
							setIsDropdownVisible(true)
							setSearchTerm("")
						}}
						onInput={(e) => {
							// 입력 시 검색어 업데이트 및 드롭다운 표시
							setSearchTerm((e.target as HTMLInputElement)?.value || "")
							setIsDropdownVisible(true)
						}}
						onKeyDown={handleKeyDown}
						placeholder={t("api.provider.searchPlaceholder")}
						role="combobox"
						style={{
							width: "100%",
							zIndex: DROPDOWN_Z_INDEX,
							position: "relative",
							minWidth: 130,
						}}
						value={searchTerm}>
						{/* 검색어가 입력된 경우에만 지우기(X) 버튼 표시 */}
						{searchTerm && searchTerm !== currentProviderLabel && (
							<div
								aria-label={t("api.provider.clearSearch")}
								className="input-icon-button codicon codicon-close"
								onClick={() => {
									setSearchTerm("")
									setIsDropdownVisible(true)
								}}
								slot="end"
								style={{
									display: "flex",
									justifyContent: "center",
									alignItems: "center",
									height: "100%",
								}}
							/>
						)}
					</VSCodeTextField>

					{/* 드롭다운 목록: isDropdownVisible일 때만 표시 */}
					{isDropdownVisible && (
						<ProviderDropdownList ref={dropdownListRef} role="listbox">
							{providerSearchResults.map((item, index) => (
								<ProviderDropdownItem
									data-testid={`provider-option-${item.value}`}
									isSelected={index === selectedIndex}
									key={item.value}
									onClick={() => handleProviderChange(item.value)}
									onMouseEnter={() => setSelectedIndex(index)}
									ref={(el) => {
										itemRefs.current[index] = el
									}}
									role="option">
									<span>{item.html}</span>
								</ProviderDropdownItem>
							))}
						</ProviderDropdownList>
					)}
				</ProviderDropdownWrapper>
			</DropdownContainer>

			{/* ============================================================
			    선택된 프로바이더에 따른 전용 설정 컴포넌트 조건부 렌더링
			    각 프로바이더는 API 키, 모델 선택, 엔드포인트 등 고유한 설정을 가집니다.
			    ============================================================ */}

			{apiConfiguration && selectedProvider === "hicap" && (
				<HicapProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />
			)}

			{apiConfiguration && selectedProvider === "cline" && (
				<ClineProvider
					currentMode={currentMode}
					initialModelTab={initialModelTab}
					isPopup={isPopup}
					showModelOptions={showModelOptions}
				/>
			)}

			{apiConfiguration && selectedProvider === "asksage" && (
				<AskSageProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />
			)}

			{apiConfiguration && selectedProvider === "anthropic" && (
				<AnthropicProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />
			)}

			{apiConfiguration && selectedProvider === "claude-code" && (
				<ClaudeCodeProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />
			)}

			{apiConfiguration && selectedProvider === "openai-native" && (
				<OpenAINativeProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />
			)}

			{apiConfiguration && selectedProvider === "openai-codex" && (
				<OpenAiCodexProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />
			)}

			{apiConfiguration && selectedProvider === "qwen" && (
				<QwenProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />
			)}

			{apiConfiguration && selectedProvider === "qwen-code" && (
				<QwenCodeProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />
			)}

			{apiConfiguration && selectedProvider === "doubao" && (
				<DoubaoProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />
			)}

			{apiConfiguration && selectedProvider === "mistral" && (
				<MistralProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />
			)}

			{apiConfiguration && selectedProvider === "openrouter" && (
				<OpenRouterProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />
			)}

			{apiConfiguration && selectedProvider === "deepseek" && (
				<DeepSeekProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />
			)}

			{apiConfiguration && selectedProvider === "together" && (
				<TogetherProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />
			)}

			{apiConfiguration && selectedProvider === "openai" && (
				<OpenAICompatibleProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />
			)}

			{apiConfiguration && selectedProvider === "vercel-ai-gateway" && (
				<VercelAIGatewayProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />
			)}

			{apiConfiguration && selectedProvider === "sambanova" && (
				<SambanovaProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />
			)}

			{apiConfiguration && selectedProvider === "bedrock" && (
				<BedrockProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />
			)}

			{apiConfiguration && selectedProvider === "vertex" && (
				<VertexProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />
			)}

			{apiConfiguration && selectedProvider === "gemini" && (
				<GeminiProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />
			)}

			{apiConfiguration && selectedProvider === "requesty" && (
				<RequestyProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />
			)}

			{apiConfiguration && selectedProvider === "fireworks" && (
				<FireworksProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />
			)}

			{/* VSCodeLm은 모델 옵션 없이 단순 렌더링 */}
			{apiConfiguration && selectedProvider === "vscode-lm" && <VSCodeLmProvider currentMode={currentMode} />}

			{apiConfiguration && selectedProvider === "groq" && (
				<GroqProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />
			)}
			{apiConfiguration && selectedProvider === "baseten" && (
				<BasetenProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />
			)}
			{apiConfiguration && selectedProvider === "litellm" && (
				<LiteLlmProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />
			)}

			{apiConfiguration && selectedProvider === "lmstudio" && (
				<LMStudioProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />
			)}

			{apiConfiguration && selectedProvider === "ollama" && (
				<OllamaProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />
			)}

			{apiConfiguration && selectedProvider === "moonshot" && (
				<MoonshotProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />
			)}

			{apiConfiguration && selectedProvider === "huggingface" && (
				<HuggingFaceProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />
			)}

			{apiConfiguration && selectedProvider === "nebius" && (
				<NebiusProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />
			)}

			{apiConfiguration && selectedProvider === "wandb" && (
				<WandbProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />
			)}

			{apiConfiguration && selectedProvider === "xai" && (
				<XaiProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />
			)}

			{apiConfiguration && selectedProvider === "cerebras" && (
				<CerebrasProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />
			)}

			{apiConfiguration && selectedProvider === "sapaicore" && (
				<SapAiCoreProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />
			)}

			{apiConfiguration && selectedProvider === "huawei-cloud-maas" && (
				<HuaweiCloudMaasProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />
			)}

			{apiConfiguration && selectedProvider === "dify" && (
				<DifyProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />
			)}

			{apiConfiguration && selectedProvider === "zai" && (
				<ZAiProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />
			)}

			{apiConfiguration && selectedProvider === "minimax" && (
				<MinimaxProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />
			)}

			{apiConfiguration && selectedProvider === "nousResearch" && (
				<NousResearchProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />
			)}

			{/* OCA는 showModelOptions 없이 단순 렌더링 */}
			{apiConfiguration && selectedProvider === "oca" && <OcaProvider currentMode={currentMode} isPopup={isPopup} />}

			{apiConfiguration && selectedProvider === "aihubmix" && (
				<AIhubmixProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />
			)}

			{/* ============================================================
			    에러 메시지 표시 영역
			    - apiErrorMessage: API 키 인증 실패 등의 에러
			    - modelIdErrorMessage: 모델 ID가 잘못되었을 때의 에러
			    ============================================================ */}
			{apiErrorMessage && (
				<p
					style={{
						margin: "-10px 0 4px 0",
						fontSize: 12,
						color: "var(--vscode-errorForeground)",
					}}>
					{apiErrorMessage}
				</p>
			)}
			{modelIdErrorMessage && (
				<p
					style={{
						margin: "-10px 0 4px 0",
						fontSize: 12,
						color: "var(--vscode-errorForeground)",
					}}>
					{modelIdErrorMessage}
				</p>
			)}
		</div>
	)
}

export default ApiOptions

// ============================================================
// Styled Components 정의
// ============================================================

/** 드롭다운 입력 필드와 목록을 감싸는 상대 위치 컨테이너 */
const ProviderDropdownWrapper = styled.div`
	position: relative;
	width: 100%;
`

/**
 * 프로바이더 검색 결과 목록 스타일
 * - 입력 필드 바로 아래에 절대 위치로 표시
 * - 최대 200px 높이 + 스크롤
 * - VS Code 드롭다운 배경색 사용
 */
const ProviderDropdownList = styled.div`
	position: absolute;
	top: calc(100% - 3px);
	left: 0;
	width: calc(100% - 2px);
	max-height: 200px;
	overflow-y: auto;
	background-color: var(--vscode-dropdown-background);
	border: 1px solid var(--vscode-list-activeSelectionBackground);
	z-index: ${DROPDOWN_Z_INDEX - 1};
	border-bottom-left-radius: 3px;
	border-bottom-right-radius: 3px;
`

/**
 * 개별 프로바이더 항목 스타일
 * - isSelected: 키보드로 현재 포커스된 항목이면 선택 배경색 적용
 * - hover: 마우스 오버 시 선택 배경색 적용
 * - word-break: 긴 프로바이더 이름이 줄 바꿈되도록 처리
 */
const ProviderDropdownItem = styled.div<{ isSelected: boolean }>`
	padding: 5px 10px;
	cursor: pointer;
	word-break: break-all;
	white-space: normal;

	background-color: ${({ isSelected }) => (isSelected ? "var(--vscode-list-activeSelectionBackground)" : "inherit")};

	&:hover {
		background-color: var(--vscode-list-activeSelectionBackground);
	}
`
