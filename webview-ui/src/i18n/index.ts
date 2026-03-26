import en from "./locales/en"
import ko from "./locales/ko"

const locales: Record<string, Record<string, string>> = { en, ko }

/**
 * Maps the preferredLanguage setting value to a locale key.
 * The setting stores values like "Korean - 한국어", "English", etc.
 */
function resolveLocale(preferredLanguage: string | undefined): string {
	if (!preferredLanguage) return "en"
	const lang = preferredLanguage.toLowerCase()
	if (lang.startsWith("korean") || lang === "한국어") return "ko"
	return "en"
}

/**
 * Creates a translation function for the given language preference.
 * Falls back to English if the key is not found in the target locale.
 */
export function createTranslator(preferredLanguage: string | undefined): (key: string) => string {
	const locale = resolveLocale(preferredLanguage)
	const messages = locales[locale] ?? en

	return (key: string): string => {
		return messages[key] ?? en[key] ?? key
	}
}
