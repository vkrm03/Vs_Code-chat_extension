const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

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
      let html = fs.readFileSync(indexPath, 'utf-8');
      html = html.replace(
        /src="\//g,
        `src="${panel.webview.asWebviewUri(
          vscode.Uri.file(path.join(context.extensionPath, 'out'))
        )}/`
      );
      panel.webview.html = html;

      panel.webview.onDidReceiveMessage(
        (message) => {
          if (message.type === 'chat') {
            console.log('User said:', message.text);
            panel.webview.postMessage({
              type: 'response',
              text: `You said: "${message.text}"`,
            });
          }
        },
        undefined,
        context.subscriptions
      );
    })
  );
}

exports.activate = activate;
