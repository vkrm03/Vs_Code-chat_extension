const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand('chatbot.openChat', () => {
      const panel = vscode.window.createWebviewPanel(
        'chatbot',
        'AI Chat Assistant',
        vscode.ViewColumn.One,
        {
          enableScripts: true,
          localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'out'))]
        }
      );

      const indexPath = path.join(context.extensionPath, 'out', 'index.html');
      let html = fs.readFileSync(indexPath, 'utf8');
      html = html.replace(
        /src="\//g,
        `src="${panel.webview.asWebviewUri(
          vscode.Uri.file(path.join(context.extensionPath, 'out'))
        )}/`
      );
      panel.webview.html = html;

      panel.webview.onDidReceiveMessage((msg) => {
        if (msg.type === 'chat') {
          panel.webview.postMessage({
            type: 'response',
            text: `Echo: ${msg.text}`
          });
        }
      });
    })
  );
}

exports.activate = activate;
