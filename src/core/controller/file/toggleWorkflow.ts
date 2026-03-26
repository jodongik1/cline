import { ClineRulesToggles, RuleScope, ruleScopeFromJSON, ToggleWorkflowRequest } from "@shared/proto/cline/file"
import { Logger } from "@/shared/services/Logger"
import { Controller } from ".."

/**
 * Toggles a workflow on or off
 * @param controller The controller instance
 * @param request The request containing the workflow path and enabled state
 * @returns The updated workflow toggles
 */
export async function toggleWorkflow(controller: Controller, request: ToggleWorkflowRequest): Promise<ClineRulesToggles> {
	const { workflowPath, enabled } = request
	// JSON 인코딩(standalone/WebSocket)에서 enum이 문자열로 전달될 수 있으므로 정규화
	// protobuf JSON에서 enum 기본값(0)은 생략되므로, undefined인 경우 LOCAL(0)으로 처리
	let scope: RuleScope
	if (request.scope === undefined || request.scope === null) {
		scope = RuleScope.LOCAL
	} else if (typeof request.scope === "string") {
		scope = ruleScopeFromJSON(request.scope)
	} else {
		scope = request.scope
	}

	if (!workflowPath || typeof enabled !== "boolean" || scope === undefined) {
		Logger.error("toggleWorkflow: Missing or invalid parameters", {
			workflowPath,
			scope,
			enabled: typeof enabled === "boolean" ? enabled : `Invalid: ${typeof enabled}`,
		})
		throw new Error("Missing or invalid parameters for toggleWorkflow")
	}

	// Handle the three different scopes
	let toggles: Record<string, boolean>

	switch (scope) {
		case RuleScope.GLOBAL: {
			toggles = controller.stateManager.getGlobalSettingsKey("globalWorkflowToggles")
			toggles[workflowPath] = enabled
			controller.stateManager.setGlobalState("globalWorkflowToggles", toggles)
			break
		}
		case RuleScope.LOCAL: {
			toggles = controller.stateManager.getWorkspaceStateKey("workflowToggles")
			toggles[workflowPath] = enabled
			controller.stateManager.setWorkspaceState("workflowToggles", toggles)
			break
		}
		case RuleScope.REMOTE: {
			toggles = controller.stateManager.getGlobalStateKey("remoteWorkflowToggles")
			toggles[workflowPath] = enabled
			controller.stateManager.setGlobalState("remoteWorkflowToggles", toggles)
			break
		}
		default:
			throw new Error(`Invalid scope: ${scope}`)
	}

	await controller.postStateToWebview()

	// Return the updated toggles
	return ClineRulesToggles.create({ toggles: toggles })
}
