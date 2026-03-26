import { useMemo } from "react"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { createTranslator } from "./index"

/**
 * React hook that provides a translation function `t(key)` based on
 * the user's preferredLanguage setting.
 *
 * Usage:
 *   const { t } = useTranslation()
 *   return <span>{t("settings.title")}</span>
 */
export function useTranslation() {
	const { preferredLanguage } = useExtensionState()
	const t = useMemo(() => createTranslator(preferredLanguage), [preferredLanguage])
	return { t }
}
