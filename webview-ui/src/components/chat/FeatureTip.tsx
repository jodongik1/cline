import { LightbulbIcon } from "lucide-react"
import { memo, useCallback, useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface FeatureTipItem {
	text: string
}

const FEATURE_TIPS: FeatureTipItem[] = [
	{
		text: '설정에서 "완료 재확인"을 활성화하면 Cline이 작업을 마치기 전에 결과를 검토합니다.',
	},
	{
		text: "프로젝트 루트에 .clinerules 파일을 추가하면 Cline에게 프로젝트별 지침을 제공할 수 있습니다.",
	},
	{
		text: "Plan 모드로 전환하면 Cline이 실행하기 전에 접근 방식을 논의하고 계획할 수 있습니다.",
	},
	{
		text: "채팅 입력창에서 @를 사용하면 파일, 폴더, URL을 작업의 컨텍스트로 추가할 수 있습니다.",
	},
	{
		text: "MCP 서버를 설정하면 Cline에게 외부 도구와 API 접근 권한을 부여할 수 있습니다.",
	},
	{
		text: "Cline은 변경 후 체크포인트를 생성합니다 — 언제든지 이전 상태로 복원할 수 있습니다.",
	},
	{
		text: "/compact를 사용하면 긴 대화를 압축하여 컨텍스트 창 공간을 확보할 수 있습니다.",
	},
	{
		text: "파일 읽기와 같은 읽기 전용 도구에 자동 승인을 활성화하면 탐색 속도가 빨라집니다.",
	},
	{
		text: "인용 버튼을 사용하면 Cline의 응답에서 텍스트를 선택해 답변에 참조할 수 있습니다.",
	},
	{
		text: "채팅창에 이미지를 드래그 앤 드롭하면 Cline과 스크린샷을 공유할 수 있습니다.",
	},
	{
		text: "Cline은 웹사이트를 탐색할 수 있습니다 — 브라우저에서 로컬 개발 서버를 테스트해보세요.",
	},
	{
		text: "/reportbug를 사용하면 진단 컨텍스트가 포함된 GitHub 이슈를 빠르게 제출할 수 있습니다.",
	},
]

const SHOW_DELAY_MS = 2000
const CYCLE_INTERVAL_MS = 8000
const FADE_DURATION_MS = 300

/**
 * Shows rotating feature tips below the "Thinking..." indicator.
 * Appears after a brief delay and cycles through tips while Cline is thinking.
 */
export const FeatureTip = memo(() => {
	const [isVisible, setIsVisible] = useState(false)
	const [hasFadedIn, setHasFadedIn] = useState(false)
	const [isFading, setIsFading] = useState(false)
	const [tipIndex, setTipIndex] = useState(() => Math.floor(Math.random() * FEATURE_TIPS.length))
	const cycleTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
	const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	const currentTip = FEATURE_TIPS[tipIndex]

	const advanceTip = useCallback(() => {
		setIsFading(true)
		fadeTimerRef.current = setTimeout(() => {
			setTipIndex((prev) => (prev + 1) % FEATURE_TIPS.length)
			setIsFading(false)
		}, FADE_DURATION_MS)
	}, [])

	useEffect(() => {
		showTimerRef.current = setTimeout(() => {
			setIsVisible(true)
			// Trigger fade-in on next frame so transition applies
			requestAnimationFrame(() => setHasFadedIn(true))
			cycleTimerRef.current = setInterval(advanceTip, CYCLE_INTERVAL_MS)
		}, SHOW_DELAY_MS)

		return () => {
			if (showTimerRef.current) {
				clearTimeout(showTimerRef.current)
			}
			if (cycleTimerRef.current) {
				clearInterval(cycleTimerRef.current)
			}
			if (fadeTimerRef.current) {
				clearTimeout(fadeTimerRef.current)
			}
		}
	}, [advanceTip])

	if (!isVisible) {
		return null
	}

	return (
		<div
			className={cn(
				"flex items-start gap-1.5 mt-2 ml-1 transition-opacity duration-300",
				!hasFadedIn || isFading ? "opacity-0" : "opacity-100",
			)}>
			<LightbulbIcon className="size-3 text-description shrink-0 mt-[1px]" />
			<span className="text-xs text-description leading-relaxed">
				<span className="font-medium">팁:</span> {currentTip.text}
			</span>
		</div>
	)
})

FeatureTip.displayName = "FeatureTip"
