import { getWorkspaceBasename } from "@core/workspace"
import type { ToggleClineRuleRequest } from "@shared/proto/cline/file"
import { RuleScope, ruleScopeFromJSON, ToggleClineRules } from "@shared/proto/cline/file"
import { telemetryService } from "@/services/telemetry"
import { Logger } from "@/shared/services/Logger"
import type { Controller } from "../index"

/**
 * Toggles a Cline rule (enable or disable)
 * @param controller The controller instance
 * @param request The toggle request
 * @returns The updated Cline rule toggles
 */
export async function toggleClineRule(controller: Controller, request: ToggleClineRuleRequest): Promise<ToggleClineRules> {
	const { rulePath, enabled } = request
	// protobuf JSON에서 enum 기본값(0)은 생략되므로, undefined인 경우 LOCAL(0)으로 처리
	let scope: RuleScope
	if (request.scope === undefined || request.scope === null) {
		scope = RuleScope.LOCAL
	} else if (typeof request.scope === "string") {
		scope = ruleScopeFromJSON(request.scope)
	} else {
		scope = request.scope
	}

	if (!rulePath || typeof enabled !== "boolean" || scope === undefined) {
		Logger.error("toggleClineRule: Missing or invalid parameters", {
			rulePath,
			scope,
			enabled: typeof enabled === "boolean" ? enabled : `Invalid: ${typeof enabled}`,
		})
		throw new Error("Missing or invalid parameters for toggleClineRule")
	}

	// Handle the three different scopes
	switch (scope) {
		case RuleScope.GLOBAL: {
			const toggles = controller.stateManager.getGlobalSettingsKey("globalClineRulesToggles")
			toggles[rulePath] = enabled
			controller.stateManager.setGlobalState("globalClineRulesToggles", toggles)
			break
		}
		case RuleScope.LOCAL: {
			const toggles = controller.stateManager.getWorkspaceStateKey("localClineRulesToggles")
			toggles[rulePath] = enabled
			controller.stateManager.setWorkspaceState("localClineRulesToggles", toggles)
			break
		}
		case RuleScope.REMOTE: {
			const toggles = controller.stateManager.getGlobalStateKey("remoteRulesToggles")
			toggles[rulePath] = enabled
			controller.stateManager.setGlobalState("remoteRulesToggles", toggles)
			break
		}
		default:
			throw new Error(`Invalid scope: ${scope}`)
	}

	// Track rule toggle telemetry with current task context
	if (controller.task?.ulid) {
		// Extract just the filename for privacy (no full paths)
		const ruleFileName = getWorkspaceBasename(rulePath, "Controller.toggleClineRule")
		const isGlobal = scope === RuleScope.GLOBAL
		telemetryService.captureClineRuleToggled(controller.task.ulid, ruleFileName, enabled, isGlobal)
	}

	// Get the current state to return in the response
	const globalToggles = controller.stateManager.getGlobalSettingsKey("globalClineRulesToggles")
	const localToggles = controller.stateManager.getWorkspaceStateKey("localClineRulesToggles")
	const remoteToggles = controller.stateManager.getGlobalStateKey("remoteRulesToggles")

	return ToggleClineRules.create({
		globalClineRulesToggles: { toggles: globalToggles },
		localClineRulesToggles: { toggles: localToggles },
		remoteRulesToggles: { toggles: remoteToggles },
	})
}
