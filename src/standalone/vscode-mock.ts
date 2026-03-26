export const Uri = { file: (path: string) => ({ fsPath: path }) }
export const env = { clipboard: { readText: async () => "", writeText: async (t: string) => {} } }
export const extensions = { getExtension: () => undefined }
export const commands = { executeCommand: async () => undefined, registerCommand: () => ({ dispose: () => {} }) }
export const workspace = {
	getConfiguration: () => ({ get: () => undefined }),
	onDidChangeConfiguration: () => ({ dispose: () => {} }),
	fs: {
		readFile: async () => new Uint8Array(),
		writeFile: async () => {},
		stat: async () => ({ type: 1 }),
		readDirectory: async () => [],
	},
}
export const window = {
	showInformationMessage: async () => undefined,
	showWarningMessage: async () => undefined,
	showErrorMessage: async () => undefined,
	createOutputChannel: () => ({ appendLine: () => {}, show: () => {}, append: () => {} }),
}
export class EventEmitter {
	event = () => ({ dispose: () => {} })
	fire() {}
}
export enum ExtensionMode {
	Development = 1,
	Test = 2,
	Production = 3,
}
export enum ExtensionKind {
	UI = 1,
	Workspace = 2,
}
export class FileSystemError extends Error {
	static FileNotFound() {
		return new FileSystemError("FileNotFound")
	}
	static FileExists() {
		return new FileSystemError("FileExists")
	}
	static FileNotADirectory() {
		return new FileSystemError("FileNotADirectory")
	}
	static FileIsADirectory() {
		return new FileSystemError("FileIsADirectory")
	}
}
