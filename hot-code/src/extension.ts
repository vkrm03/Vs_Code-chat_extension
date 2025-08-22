import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	console.log('🔥 Chatbot VS Code extension is active!');

	// Register command to open chatbot
	const disposable = vscode.commands.registerCommand('hot-code.openChat', () => {
		ChatPanel.createOrShow(context.extensionUri);
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}

/**
 * ChatPanel: Manages the webview panel for the chatbot
 */
class ChatPanel {
	public static currentPanel: ChatPanel | undefined;

	private readonly _panel: vscode.WebviewPanel;
	private readonly _extensionUri: vscode.Uri;
	private _disposables: vscode.Disposable[] = [];

	public static createOrShow(extensionUri: vscode.Uri) {
		const column = vscode.window.activeTextEditor
			? vscode.window.activeTextEditor.viewColumn
			: undefined;

		// If we already have a panel, reveal it
		if (ChatPanel.currentPanel) {
			ChatPanel.currentPanel._panel.reveal(column);
			return;
		}

		// Otherwise, create new panel
		const panel = vscode.window.createWebviewPanel(
			'chatbot',
			'AI Chatbot',
			column || vscode.ViewColumn.One,
			{
				enableScripts: true, // Allow JS inside the webview
			}
		);

		ChatPanel.currentPanel = new ChatPanel(panel, extensionUri);
	}

	private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
		this._panel = panel;
		this._extensionUri = extensionUri;

		// Set initial HTML
		this._update();

		// Handle disposal
		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
	}

	public dispose() {
		ChatPanel.currentPanel = undefined;

		// Clean up
		this._panel.dispose();

		while (this._disposables.length) {
			const disposable = this._disposables.pop();
			if (disposable) {
				disposable.dispose();
			}
		}
	}

	private _update() {
		this._panel.webview.html = this._getHtmlForWebview();
	}

	private _getHtmlForWebview(): string {
		return /* html */ `
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>Chatbot</title>
				<style>
					body {
						font-family: sans-serif;
						padding: 10px;
					}
					#chat {
						border: 1px solid #ccc;
						padding: 8px;
						height: 300px;
						overflow-y: auto;
						margin-bottom: 10px;
					}
					#input {
						width: 80%;
						padding: 5px;
					}
					button {
						padding: 5px 10px;
					}
				</style>
			</head>
			<body>
				<h2>🤖 VS Code Chatbot</h2>
				<div id="chat"></div>
				<input id="input" placeholder="Type a message..." />
				<button onclick="sendMessage()">Send</button>

				<script>
					const chat = document.getElementById('chat');
					const input = document.getElementById('input');

					function appendMessage(sender, text) {
						const div = document.createElement('div');
						div.textContent = sender + ": " + text;
						chat.appendChild(div);
						chat.scrollTop = chat.scrollHeight;
					}

					function sendMessage() {
						const msg = input.value;
						if (!msg) return;
						appendMessage("You", msg);
						input.value = "";

						// Fake bot reply for now
						setTimeout(() => {
							appendMessage("Bot", "You said: " + msg);
						}, 500);
					}
				</script>
			</body>
			</html>
		`;
	}
}
