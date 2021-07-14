import * as vscode from "vscode";
import * as path from "path";
import { load as yamlLoad } from "js-yaml";
import { Base64 } from 'js-base64';
import * as extensionFunctions from "./extensionFunctions";

export function getYamlContent(text : string, uri:vscode.Uri) : string {
	//extensionFunctions.sendTextToOutputChannel(`Yaml text (${text}) and uri (${uri})`);
	const encodedText = encodeContent(text);
	//extensionFunctions.sendTextToOutputChannel(`Yaml encodedText (${encodedText})`);
	const htmlMe = getWebviewContent(encodedText, uri.toString());
	//extensionFunctions.sendTextToOutputChannel(`Yaml html (${htmlMe})`);
	return getWebviewContent(encodedText, uri.toString());	
}

function encodeContent(text: string) {
	return Base64.encode(JSON.stringify(yamlLoad(text)));
}

function getWebviewContent(config: string, filePath: string): string {
	const nonce = getNonce();

	// Local path to main script run in the webview
	const reactAppPathOnDisk = vscode.Uri.file(
		path.join(extensionFunctions.getContext().extensionPath, "quickstartsPreview", "quickstartsPreview.js")
	);
	const scriptPathOnDisk = vscode.Uri.file(
		path.resolve(extensionFunctions.getContext().extensionPath, 'media', 'main.js')
	);
	const reactAppUri = reactAppPathOnDisk.with({ scheme: "vscode-resource" });
	const mainScriptUri = scriptPathOnDisk.with({ scheme: "vscode-resource" });
	// need to figure out the CSP -- this gets us closer
	// 		<meta http-equiv="Content-Security-Policy"
	// content="default-src 'self';
	// img-src https:;
	// script-src 'nonce-${nonce}' 'unsafe-eval' 'unsafe-inline' vscode-resource:;
	// style-src vscode-resource: 'unsafe-inline';">

	const html = `<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>Quick Starts View</title>
		 <script>
		  // window.acquireVsCodeApi = acquireVsCodeApi;
		  window.initialData = "${config}";
		  window.filePath = "${filePath}";
		</script>
	</head>
	<body>
		<div id="root"></div>
		<script nonce="${nonce}" src="${reactAppUri}"></script>
		<script nonce="${nonce}" src="${mainScriptUri}"></script>
	</body>
	</html>`;
	return html;
}

function getNonce() : string {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}
