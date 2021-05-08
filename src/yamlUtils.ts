import * as vscode from "vscode";
import * as path from "path";
import { load as yamlLoad } from "js-yaml";
import { Base64 } from 'js-base64';
import * as extensionFunctions from "./extensionFunctions";

export function getYamlContent(text : string, uri:vscode.Uri) : string {
	const encodedText = encodeContent(text, uri.toString());
	return getWebviewContent(encodedText, uri.toString());	
}

function encodeContent(text: string, fileName: string) {
	if (fileName.endsWith(".yaml")) {
		return Base64.encode(JSON.stringify(yamlLoad(text)));
	}
	return Base64.encode(text);
}

function getWebviewContent(config: string, filePath: string): string {
	// Local path to main script run in the webview
	const reactAppPathOnDisk = vscode.Uri.file(
		path.join(extensionFunctions.getContext().extensionPath, "quickstartsPreview", "quickstartsPreview.js")
		// path.join(this._extensionPath, "quickstartsPreview", "quickstartsPreview.js")
	);
	const scriptPathOnDisk = vscode.Uri.file(
		path.resolve(extensionFunctions.getContext().extensionPath, 'media', 'main.js')
	);
	const reactAppUri = reactAppPathOnDisk.with({ scheme: "vscode-resource" });
	const mainScriptUri = scriptPathOnDisk.with({ scheme: "vscode-resource" });
	const html = `<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>Quick Starts View</title>
		<meta http-equiv="Content-Security-Policy"
					content="default-src 'self';
							 img-src https:;
							 script-src 'unsafe-eval' 'unsafe-inline' vscode-resource:;
							 style-src vscode-resource: 'unsafe-inline';">
		<script>
		  // window.acquireVsCodeApi = acquireVsCodeApi;
		  window.initialData = "${config}";
		  window.filePath = "${filePath}";
		</script>
	</head>
	<body>
		<div id="root"></div>
		<script src="${reactAppUri}"></script>
		<script src="${mainScriptUri}"></script>
	</body>
	</html>`;
	return html;
}
