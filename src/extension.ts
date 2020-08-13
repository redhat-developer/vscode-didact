/**
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as vscode from 'vscode';
import { extensionFunctions, initializeContext } from './extensionFunctions';
import * as commandConstants from './extensionFunctions';
import { DidactWebviewPanel } from './didactWebView';
import { DidactNodeProvider, TreeNode } from './nodeProvider';
import { registerTutorial, clearRegisteredTutorials, getOpenAtStartupSetting } from './utils';
import * as path from 'path';
import {DidactUriCompletionItemProviderMarkdown} from './didactUriCompletionItemProviderMarkdown';
import {DidactUriCompletionItemProviderAsciiDoc} from './didactUriCompletionItemProviderAsciiDoc';

const DIDACT_VIEW = 'didact.tutorials';

const DEFAULT_TUTORIAL_CATEGORY = "Didact";
const DEFAULT_TUTORIAL_NAME = "Didact Demo";

let didactTutorialsProvider = new DidactNodeProvider();
let didactTreeView : vscode.TreeView<TreeNode>;

export async function activate(context: vscode.ExtensionContext) {

	initializeContext(context); // stash context for command use

	// register all the various commands we provide
	context.subscriptions.push(vscode.commands.registerCommand(commandConstants.SCAFFOLD_PROJECT_COMMAND, extensionFunctions.scaffoldProjectFromJson));
	context.subscriptions.push(vscode.commands.registerCommand(commandConstants.CREATE_WORKSPACE_FOLDER_COMMAND, extensionFunctions.createTemporaryFolderAsWorkspaceRoot));
	context.subscriptions.push(vscode.commands.registerCommand(commandConstants.OPEN_TUTORIAL_COMMAND, extensionFunctions.openDidactWithDefault));
	context.subscriptions.push(vscode.commands.registerCommand(commandConstants.START_DIDACT_COMMAND, extensionFunctions.startDidact));
	context.subscriptions.push(vscode.commands.registerCommand(commandConstants.START_TERMINAL_COMMAND, extensionFunctions.startTerminal));
	context.subscriptions.push(vscode.commands.registerCommand(commandConstants.SEND_TERMINAL_SOME_TEXT_COMMAND, extensionFunctions.sendTerminalText));
	context.subscriptions.push(vscode.commands.registerCommand(commandConstants.REQUIREMENT_CHECK_COMMAND, extensionFunctions.requirementCheck));
	context.subscriptions.push(vscode.commands.registerCommand(commandConstants.EXTENSION_REQUIREMENT_CHECK_COMMAND, extensionFunctions.extensionCheck));
	context.subscriptions.push(vscode.commands.registerCommand(commandConstants.WORKSPACE_FOLDER_EXISTS_CHECK_COMMAND, extensionFunctions.validWorkspaceCheck));
	context.subscriptions.push(vscode.commands.registerCommand(commandConstants.RELOAD_DIDACT_COMMAND, extensionFunctions.reloadDidact));
	context.subscriptions.push(vscode.commands.registerCommand(commandConstants.VALIDATE_ALL_REQS_COMMAND, extensionFunctions.validateAllRequirements));
	context.subscriptions.push(vscode.commands.registerCommand(commandConstants.VIEW_OPEN_TUTORIAL_MENU, extensionFunctions.openTutorialFromView));
	context.subscriptions.push(vscode.commands.registerCommand(commandConstants.REGISTER_TUTORIAL, extensionFunctions.registerTutorial));
	context.subscriptions.push(vscode.commands.registerCommand(commandConstants.REFRESH_DIDACT_VIEW, refreshTreeview));
	context.subscriptions.push(vscode.commands.registerCommand(commandConstants.SEND_TERMINAL_KEY_SEQUENCE, extensionFunctions.sendTerminalCtrlC));
	context.subscriptions.push(vscode.commands.registerCommand(commandConstants.CLOSE_TERMINAL, extensionFunctions.closeTerminal));
	context.subscriptions.push(vscode.commands.registerCommand(commandConstants.CLI_SUCCESS_COMMAND, extensionFunctions.cliExecutionCheck));
	context.subscriptions.push(vscode.commands.registerCommand(commandConstants.VALIDATE_COMMAND_IDS, extensionFunctions.validateCommandIDsInSelectedFile));
	context.subscriptions.push(vscode.commands.registerCommand(commandConstants.TEXT_TO_CLIPBOARD_COMMAND, extensionFunctions.placeTextOnClipboard));
	context.subscriptions.push(vscode.commands.registerCommand(commandConstants.COPY_FILE_URL_TO_WORKSPACE_COMMAND, extensionFunctions.copyFileFromURLtoLocalURI));

	// set up the vscode URI handler
	vscode.window.registerUriHandler({
		async handleUri(uri:vscode.Uri) {
			await vscode.commands.executeCommand(commandConstants.START_DIDACT_COMMAND, uri);
		}
	});

	// set up our completion providers
	let markdown:vscode.DocumentSelector = { scheme: 'file', language: 'markdown', pattern: '**/**.didact.md' };
	let markdownProvider = new DidactUriCompletionItemProviderMarkdown(context);
	vscode.languages.registerCompletionItemProvider(markdown, markdownProvider);

	let asciidoc:vscode.DocumentSelector = { scheme: 'file', language: 'asciidoc', pattern: '**/**.didact.adoc' };
	let asciidocProvider = new DidactUriCompletionItemProviderAsciiDoc(context);
	vscode.languages.registerCompletionItemProvider(asciidoc, asciidocProvider);

	// if there are changes in the workspace (i.e. a new root folder being added), refresh the didact window
 	vscode.workspace.onDidChangeWorkspaceFolders( async () => {
		 await vscode.commands.executeCommand(commandConstants.RELOAD_DIDACT_COMMAND);
 	});

	// set up so we don't lose the webview contents each time it goes 'invisible' 
	if (vscode.window.registerWebviewPanelSerializer) {
		// Make sure we register a serializer in activation event
		vscode.window.registerWebviewPanelSerializer(DidactWebviewPanel.viewType, {
			async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
				DidactWebviewPanel.setContext(context);
				DidactWebviewPanel.revive(webviewPanel, context.extensionPath);
			}
		});
	}

	// always clear the registry and let the extensions register as they are activated
	await clearRegisteredTutorials();

	// register the default tutorial
	const tutorialPath = path.join(context.extensionPath, './demos/markdown/didact-demo.didact.md');
	const tutorialUri = vscode.Uri.parse(`file://${tutorialPath}`);
	await registerTutorial(DEFAULT_TUTORIAL_NAME, tutorialUri.fsPath, DEFAULT_TUTORIAL_CATEGORY);

	// register the tutorial for creating a new extension with a didact file
	const tutorial2Path = path.join(context.extensionPath, './create_extension/create-new-tutorial-with-extension.didact.md');
	const tutorial2Uri = vscode.Uri.parse(`file://${tutorial2Path}`);
	await registerTutorial("Create a New Didact Tutorial Extension", tutorial2Uri.fsPath, DEFAULT_TUTORIAL_CATEGORY);

	// register the javascript tutorial
	const tutorial3Path = path.join(context.extensionPath, './demos/markdown/helloJS/helloJS.didact.md');
	const tutorial3Uri = vscode.Uri.parse(`file://${tutorial3Path}`);
	await registerTutorial("HelloWorld with JavaScript in Three Steps", tutorial3Uri.fsPath, DEFAULT_TUTORIAL_CATEGORY);

	// create the view
	createIntegrationsView();

	// open at startup if setting is true
	const openAtStartup : boolean = getOpenAtStartupSetting();
	if (openAtStartup === true) {
		await extensionFunctions.openDidactWithDefault();
	}
}

function createIntegrationsView(): void {
	didactTreeView = vscode.window.createTreeView(DIDACT_VIEW, {
		treeDataProvider: didactTutorialsProvider
	});
	didactTreeView.onDidChangeVisibility(async () => {
		if (didactTreeView.visible === true) {
			await didactTutorialsProvider.refresh().catch(err => console.log(err));
		}
	});
}

export async function deactivate() {
	await DidactWebviewPanel.cacheFile();
	await clearRegisteredTutorials();
}

export async function refreshTreeview() {
	if (didactTreeView && didactTreeView.visible === true) {
		await didactTutorialsProvider.refresh().catch(err => console.log(err));
	}
}
