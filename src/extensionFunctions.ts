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
import * as utils from './utils';
import * as fs from 'fs';
import {DidactWebviewPanel} from './didactWebView';
import * as querystring from 'querystring';
import * as path from 'path';
import * as child_process from 'child_process';
import {getMDParser} from './markdownUtils';
import * as scaffoldUtils from './scaffoldUtils';

const fetch = require('node-fetch');

// command IDs
export const SCAFFOLD_PROJECT_COMMAND = 'vscode.didact.scaffoldProject';
export const OPEN_TUTORIAL_COMMAND = 'vscode.didact.openTutorial';
export const START_DIDACT_COMMAND = 'vscode.didact.startDidact';
export const START_TERMINAL_COMMAND = 'vscode.didact.startTerminalWithName';
export const SEND_TERMINAL_SOME_TEXT_COMMAND = 'vscode.didact.sendNamedTerminalAString';
export const REQUIREMENT_CHECK_COMMAND = 'vscode.didact.requirementCheck';
export const EXTENSION_REQUIREMENT_CHECK_COMMAND = 'vscode.didact.extensionRequirementCheck';
export const WORKSPACE_FOLDER_EXISTS_CHECK_COMMAND = 'vscode.didact.workspaceFolderExistsCheck';
export const CREATE_WORKSPACE_FOLDER_COMMAND = 'vscode.didact.createWorkspaceFolder';
export const RELOAD_DIDACT_COMMAND = 'vscode.didact.reload';

// stash the extension context for use by the commands 
export function initializeContext(inContext: vscode.ExtensionContext) {
	extensionFunctions.setContext(inContext);
}

// contain all the various command functions in one spot
export namespace extensionFunctions {

	// stashed extension context
	let context : vscode.ExtensionContext;

	// stashed markdown URI
	let _mdFileUri : vscode.Uri | undefined = undefined;

	// stash the context so we have it for use by the command functions without passing it each time
	export function setContext(inContext: vscode.ExtensionContext) {
		context = inContext;
	}

	// use the json to model the folder/file structure to be created in the vscode workspace
	export async function scaffoldProjectFromJson(jsonpath:vscode.Uri) {
		if (utils.getWorkspacePath) {
			let testJson : any;
			if (jsonpath) {
				var mdStr = fs.readFileSync(jsonpath.fsPath, 'utf8');
				testJson = JSON.parse(mdStr);
			} else {
				testJson = scaffoldUtils.createSampleProject();
			}
			await scaffoldUtils.createFoldersFromJSON(testJson, jsonpath)
			.catch( (error) => {
				throw new Error(`Error found while scaffolding didact project: ${error}`);
			});
		} else {
			throw new Error('No workspace folder. Workspace must have at least one folder before Didact scaffolding can begin.'); 
		}
	}

	// quick and dirty workaround for an empty workspace - creates a folder in the user's temporary store 
	export async function createTemporaryFolderAsWorkspaceRoot(requirement: string | undefined) {
		var tmp = require('tmp');
		// if the workspace is empty, we will create a temporary one for the user 
		var tmpobj = tmp.dirSync();
		let rootUri : vscode.Uri = vscode.Uri.parse(`file://${tmpobj.name}`);
		vscode.workspace.updateWorkspaceFolders(0,undefined, {uri: rootUri});
		if (requirement) {
			if (rootUri) {
				postRequirementsResponseMessage(requirement, true);
			} else {
				postRequirementsResponseMessage(requirement, false);
			}	
		}
	}

	// utility command to start a named terminal so we have a handle to it
	export async function startTerminal(...rest: any[]) { //name:string, path: vscode.Uri) {
		let name : string | undefined = undefined;
		let uri : vscode.Uri | undefined = undefined;
		if (rest) {
			try {
				for(let arg of rest) {
					if (typeof arg === 'string' ) {
						name = arg as string;
					} else if (typeof arg === 'object' ) {
						uri = arg as vscode.Uri;
					}
				}
			} catch (error) {
				throw new Error(error);
			}
		}
		if (name) {
			if (findTerminal(name)) {
				throw new Error(`Terminal ${name} already exists`);
			}
		}
		let terminal : vscode.Terminal | undefined = undefined;
		if (name && uri) {
			terminal = vscode.window.createTerminal({
				name: `${name}`,
				cwd: `${uri.fsPath}`
			});
		} else if (name) {
			terminal = vscode.window.createTerminal({
				name: `${name}`
			});
		} else {
			terminal = vscode.window.createTerminal();
		}
		if (terminal) {
			terminal.show();
		}
	}

	async function showAndSendText(terminal: vscode.Terminal, text:string) {
		if (terminal) {
			terminal.show();
			terminal.sendText(text);
			return;
		}
	}

	function findTerminal(name: string) : vscode.Terminal | undefined {
		for(let localTerm of vscode.window.terminals){
			if(localTerm.name === name){ 
				return localTerm; 
			}
		}		
		return undefined;
	}

	// send a message to a named terminal
	export async function sendTerminalText(name:string, text:string) {
		const terminal : vscode.Terminal | undefined = findTerminal(name);
		if (!terminal) {
			const newterminal = vscode.window.createTerminal(name);
			showAndSendText(newterminal, text);
		}
		if (terminal) {
			showAndSendText(terminal, text);
		}
	}

	// reset the didact window to use the default set in the settings
	export async function openDidactWithDefault() {
		DidactWebviewPanel.createOrShow(context.extensionPath);
		DidactWebviewPanel.addListener(context);
		_mdFileUri = undefined;
		DidactWebviewPanel.hardReset();		
	}

	// open the didact window with the markdown passed in via Uri
	export async function startDidact(uri:vscode.Uri) {
		// stash it
		_mdFileUri = uri;

		// handle extension, workspace, https, and http
		if (uri) {
			const query = querystring.parse(uri.query);
			if (query.extension) {
				const value = utils.getValue(query.extension);
				if (value) {
					if (context.extensionPath === undefined) { 
						return; 
					}
					_mdFileUri = vscode.Uri.file(
						path.join(context.extensionPath, value)
					);
				}
			} else if (query.workspace) {
				const value = utils.getValue(query.workspace);
				if (value) {
					if (vscode.workspace.workspaceFolders) {
						var workspace = vscode.workspace.workspaceFolders[0] as vscode.WorkspaceFolder;
						let rootPath = workspace.uri.fsPath;
						_mdFileUri = vscode.Uri.file(path.join(rootPath, value));
					}
				}
			} else if (query.https) {
				const value = utils.getValue(query.https);
				if (value) {
					_mdFileUri = vscode.Uri.parse(`https://${value}`);
				}
			} else if (query.http) {
				const value = utils.getValue(query.http);
				if (value) {
					_mdFileUri = vscode.Uri.parse(`http://${value}`);
				}
			} else if (uri.fsPath) {
				_mdFileUri = uri;
			}
		}
		DidactWebviewPanel.createOrShow(context.extensionPath);
		DidactWebviewPanel.addListener(context);
		if (DidactWebviewPanel.currentPanel && _mdFileUri) {
			DidactWebviewPanel.currentPanel.setMDPath(_mdFileUri);
		}
	}

	// very basic requirements testing -- check to see if the results of a command executed at CLI returns a known result
	// example: testCommand = mvn --version, testResult = 'Apache Maven' 
	export async function requirementCheck(requirement: string, testCommand: string, testResult: string) {
		let result = child_process.execSync(testCommand);
		if (result.includes(testResult)) {
			postRequirementsResponseMessage(requirement, true);
			return;
		} else {
			postRequirementsResponseMessage(requirement, false);
		}	
	}

	// very basic requirements testing -- check to see if the extension Id is installed in the user workspace
	export async function extensionCheck(requirement: string, extensionId: string) {
		let testExt = vscode.extensions.getExtension(extensionId);
		if (testExt) {
			postRequirementsResponseMessage(requirement, true);
			return;
		} else {
			postRequirementsResponseMessage(requirement, false);
		}	
	}

	// very basic test -- check to see if the workspace has at least one root folder
	export async function validWorkspaceCheck(requirement: string) {
		let wsPath = utils.getWorkspacePath();
		if (wsPath) {
			postRequirementsResponseMessage(requirement, true);
			return;
		} else {
			postRequirementsResponseMessage(requirement, false);
		}	
	}

	// dispose of and reload the didact window with the latest Uri
	export async function reloadDidact() {
		if (DidactWebviewPanel.currentPanel) {
			DidactWebviewPanel.currentPanel.dispose();
		}
		await vscode.commands.executeCommand(START_DIDACT_COMMAND, _mdFileUri);
	}

	// send a message back to the webview - used for requirements testing mostly 
	function postRequirementsResponseMessage(requirement: string, booleanResponse: boolean) {
		if (requirement && booleanResponse && DidactWebviewPanel.currentPanel) {
			DidactWebviewPanel.postRequirementsResponseMessage(requirement, booleanResponse);
		}
	}

	// retrieve the markdown content to render as HTML
	export async function getWebviewContent() : Promise<string|void> {
		if (!_mdFileUri) {
			const configuredUri : string | undefined = vscode.workspace.getConfiguration().get('didact.defaultUrl');
			if (configuredUri) {
				_mdFileUri = vscode.Uri.parse(configuredUri);
			}
		}
		if (_mdFileUri) {
			if (_mdFileUri.scheme === 'file') {
				return await getDataFromFile(_mdFileUri).catch( (error) => {
					if (_mdFileUri) {
						vscode.window.showErrorMessage(`File at ${_mdFileUri.toString()} is unavailable`);
					}
					console.log(error);
				});
			} else if (_mdFileUri.scheme === 'http' || _mdFileUri.scheme === 'https'){
				const urlToFetch = _mdFileUri.toString();
				return await getDataFromUrl(urlToFetch).catch( (error) => {
					if (_mdFileUri) {
						vscode.window.showErrorMessage(`File at ${_mdFileUri.toString()} is unavailable`);
					}
					console.log(error);
				});
			}
		}
		return undefined;
	}
	
	// retrieve markdown text from a file
	async function getDataFromFile(uri:vscode.Uri) : Promise<string> {
		try {
			const content = fs.readFileSync(uri.fsPath, 'utf8');
			const parser = getMDParser();
			const result = parser.render(content);
			return result;
		} catch (error) {
			throw new Error(error);
		}
	}
	
	// retrieve markdown text from a url
	async function getDataFromUrl(url:string) : Promise<string> {
		try {
			const response = await fetch(url);
			const content = await response.text();
			const parser = getMDParser();
			const result = parser.render(content);
			return result;
		} catch (error) {
			throw new Error(error);
		}
	}
}
