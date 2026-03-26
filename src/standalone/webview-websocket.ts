import { Controller } from "@core/controller"
import { handleGrpcRequest, handleGrpcRequestCancel } from "@core/controller/grpc-handler"
import { ExtensionMessage } from "@shared/ExtensionMessage"
import { WebSocketServer } from "ws"

export function startWebsocketServer(controller: Controller, port: number) {
	const wss = new WebSocketServer({ port })
	wss.on("connection", (ws) => {
		console.log("[Cline] WebSocket client connected")
		const postMessageToWebview = async (message: ExtensionMessage) => {
			if (ws.readyState === ws.OPEN) {
				ws.send(JSON.stringify(message))
				return true
			}
			return false
		}

		ws.on("message", async (data) => {
			try {
				const message = JSON.parse(data.toString())
				if (message.type === "grpc_request" && message.grpc_request) {
					await handleGrpcRequest(controller, postMessageToWebview, message.grpc_request)
				} else if (message.type === "grpc_request_cancel" && message.grpc_request_cancel) {
					await handleGrpcRequestCancel(postMessageToWebview, message.grpc_request_cancel)
				}
			} catch (err) {
				console.error("WS Message error", err)
			}
		})
	})
	console.log(`[Cline] Standalone Webview WebSocket Server started on ws://127.0.0.1:${port}`)
	return wss
}
