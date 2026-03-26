import { Boolean } from "@shared/proto/cline/common"
import { PlanActMode, planActModeFromJSON, TogglePlanActModeRequest } from "@shared/proto/cline/state"
import { Mode } from "@shared/storage/types"
import { Logger } from "@/shared/services/Logger"
import { Controller } from ".."

/**
 * Toggles between Plan and Act modes
 * @param controller The controller instance
 * @param request The request containing the chat settings and optional chat content
 * @returns An empty response
 */
export async function togglePlanActModeProto(controller: Controller, request: TogglePlanActModeRequest): Promise<Boolean> {
	try {
		// JSON 인코딩(standalone/WebSocket)에서 enum이 문자열로 전달될 수 있으므로 정규화
		// protobuf JSON에서 enum 기본값(0)은 생략되므로, undefined인 경우 PLAN(0)으로 처리
		let normalizedMode: PlanActMode
		if (request.mode === undefined || request.mode === null) {
			normalizedMode = PlanActMode.PLAN
		} else if (typeof request.mode === "string") {
			normalizedMode = planActModeFromJSON(request.mode)
		} else {
			normalizedMode = request.mode
		}

		let mode: Mode
		if (normalizedMode === PlanActMode.PLAN) {
			mode = "plan"
		} else if (normalizedMode === PlanActMode.ACT) {
			mode = "act"
		} else {
			throw new Error(`Invalid mode value: ${request.mode} (normalized: ${normalizedMode})`)
		}
		const chatContent = request.chatContent

		// Call the existing controller implementation
		const sentMessage = await controller.togglePlanActMode(mode, chatContent)

		return Boolean.create({
			value: sentMessage,
		})
	} catch (error) {
		Logger.error("Failed to toggle Plan/Act mode:", error instanceof Error ? error.message : String(error))
		throw error
	}
}
