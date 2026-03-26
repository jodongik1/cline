import platformConfigs from "./platform-configs.json"

export interface PlatformConfig {
	type: PlatformType
	messageEncoding: MessageEncoding
	showNavbar: boolean
	postMessage: PostMessageFunction
	encodeMessage: MessageEncoder
	decodeMessage: MessageDecoder
	togglePlanActKeys: string
	supportsTerminalMentions: boolean
}

export enum PlatformType {
	VSCODE = 0,
	STANDALONE = 1,
}

function stringToPlatformType(name: string): PlatformType {
	const mapping: Record<string, PlatformType> = {
		vscode: PlatformType.VSCODE,
		standalone: PlatformType.STANDALONE,
	}
	if (name in mapping) {
		return mapping[name]
	}
	console.error("Unknown platform:", name)
	// Default to VSCode for unknown types
	return PlatformType.VSCODE
}

// Internal type for JSON structure (not exported)
type PlatformConfigJson = {
	messageEncoding: "none" | "json"
	showNavbar: boolean
	postMessageHandler: "vscode" | "standalone"
	togglePlanActKeys: string
	supportsTerminalMentions: boolean
}

type PlatformConfigs = Record<string, PlatformConfigJson>

// Global type declarations for postMessage and vscode API
declare global {
	interface Window {
		// This is the post message handler injected by JetBrains.
		// !! Do not change the name of the handler without updating it on
		// the JetBrains side as well. !!
		standalonePostMessage?: (message: string) => void
		__standaloneWebSocket?: WebSocket
	}
	function acquireVsCodeApi(): any
}

// Initialize the vscode API if available
const vsCodeApi = typeof acquireVsCodeApi === "function" ? acquireVsCodeApi() : null

// Implementations for post message handling
const postMessageStrategies: Record<string, PostMessageFunction> = {
	vscode: (message: any) => {
		if (vsCodeApi) {
			vsCodeApi.postMessage(message)
		} else {
			console.log("postMessage fallback: ", message)
		}
	},
	standalone: (message: any) => {
		// For standalone environments (e.g., JetBrains Plugin), use WebSocket to bypass the host JVM proxy directly to cline-core.js.
		// Recreate the WebSocket if it has been closed or is closing (e.g., after a timeout or error).
		const ws = window.__standaloneWebSocket
		if (!ws || ws.readyState === WebSocket.CLOSED || ws.readyState === WebSocket.CLOSING) {
			const newWs = new WebSocket("ws://localhost:26041")
			window.__standaloneWebSocket = newWs
			newWs.onmessage = (event) => {
				try {
					const msg = JSON.parse(event.data)
					console.log(
						"[WS→APP] msg type:",
						msg?.type,
						"request_id:",
						msg?.grpc_response?.request_id,
						"is_streaming:",
						msg?.grpc_response?.is_streaming,
					)
					window.dispatchEvent(new MessageEvent("message", { data: msg }))
				} catch (e) {
					console.error("Failed to parse WebSocket message:", e)
				}
			}
			// Track reconnect attempts to use progressive back-off
			const attempt = ((window as any).__wsReconnectAttempt ?? 0) as number
			newWs.onopen = () => {
				console.log("[WS] Connected to cline-core")
				;(window as any).__wsReconnectAttempt = 0
			}
			newWs.onerror = (e) => {
				console.error("Standalone WebSocket error, will retry:", e)
			}
			newWs.onclose = () => {
				window.__standaloneWebSocket = undefined
				// Progressive back-off: 2s, 3s, 4s, max 5s — prevents tight reload loops
				const nextAttempt = attempt + 1
				const delay = Math.min(2000 + nextAttempt * 1000, 5000)
				const maxAttempts = 15
				if (nextAttempt <= maxAttempts) {
					;(window as any).__wsReconnectAttempt = nextAttempt
					console.log(`[WS] Connection closed, reloading in ${delay}ms (attempt ${nextAttempt}/${maxAttempts})...`)
					setTimeout(() => {
						window.location.reload()
					}, delay)
				} else {
					console.error("[WS] Max reconnect attempts reached. Please restart the IDE.")
				}
			}
		}

		const activeWs = window.__standaloneWebSocket
		if (!activeWs) return
		if (activeWs.readyState === WebSocket.OPEN) {
			console.log("[APP→WS] sending:", message?.type, message?.grpc_request?.method)
			activeWs.send(JSON.stringify(message))
		} else {
			activeWs.addEventListener("open", () => {
				console.log("[APP→WS] sending (delayed):", message?.type, message?.grpc_request?.method)
				activeWs.send(JSON.stringify(message))
			})
		}
	},
}

// Implementations for message encoding
const messageEncoders: Record<string, MessageEncoder> = {
	none: <T>(message: T, _encoder: (_: T) => unknown) => message,
	json: <T>(message: T, encoder: (_: T) => unknown) => encoder(message),
}

// Implementations for message decoding
const messageDecoders: Record<string, MessageDecoder> = {
	none: <T>(message: any, _decoder: (_: { [key: string]: any }) => T) => message,
	json: <T>(message: any, decoder: (_: { [key: string]: any }) => T) => decoder(message),
}

// Local declaration of the platform compile-time constant
declare const __PLATFORM__: string

// Get the specific platform config at compile time
const configs = platformConfigs as PlatformConfigs
const selectedConfig = configs[__PLATFORM__]
console.log("[PLATFORM_CONFIG] Build platform:", __PLATFORM__)

// Build the platform config with injected functions
// Callers should use this in the situations where the react component is not available.
export const PLATFORM_CONFIG: PlatformConfig = {
	type: stringToPlatformType(__PLATFORM__),
	messageEncoding: selectedConfig.messageEncoding,
	showNavbar: selectedConfig.showNavbar,
	postMessage: postMessageStrategies[selectedConfig.postMessageHandler],
	encodeMessage: messageEncoders[selectedConfig.messageEncoding],
	decodeMessage: messageDecoders[selectedConfig.messageEncoding],
	togglePlanActKeys: selectedConfig.togglePlanActKeys,
	supportsTerminalMentions: selectedConfig.supportsTerminalMentions,
}

type MessageEncoding = "none" | "json"

// Function types for platform-specific behaviors
type PostMessageFunction = (message: any) => void
type MessageEncoder = <T>(message: T, encoder: (_: T) => unknown) => any
type MessageDecoder = <T>(message: any, decoder: (_: { [key: string]: any }) => T) => T
