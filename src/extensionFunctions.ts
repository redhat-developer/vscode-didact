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
import {parseADtoHTML} from './asciidocUtils';
import * as scaffoldUtils from './scaffoldUtils';
import { TreeNode } from './nodeProvider';
import { handleExtFilePath, handleProjectFilePath } from './commandHandler';
import * as url from 'url';
import * as download from 'download';

let didactOutputChannel: vscode.OutputChannel | undefined = undefined;

const fetch = require('node-fetch');
const DOMParser = require('xmldom').DOMParser;

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
export const VALIDATE_ALL_REQS_COMMAND = 'vscode.didact.validateAllRequirements';
export const GATHER_ALL_REQS_COMMAND = 'vscode.didact.gatherAllRequirements';
export const GATHER_ALL_COMMANDS = 'vscode.didact.gatherAllCommands';
export const VIEW_OPEN_TUTORIAL_MENU = 'vscode.didact.view.tutorial.open';
export const REGISTER_TUTORIAL = 'vscode.didact.register'; // name, uri, category
export const REFRESH_DIDACT_VIEW = 'vscode.didact.view.refresh';
export const SEND_TERMINAL_KEY_SEQUENCE = 'vscode.didact.sendNamedTerminalCtrlC';
export const CLOSE_TERMINAL = 'vscode.didact.closeNamedTerminal';
export const CLI_SUCCESS_COMMAND = 'vscode.didact.cliCommandSuccessful';
export const VALIDATE_COMMAND_IDS = 'vscode.didact.verifyCommands';
export const TEXT_TO_CLIPBOARD_COMMAND = 'vscode.didact.copyToClipboardCommand';
export const COPY_FILE_URL_TO_WORKSPACE_COMMAND = 'vscode.didact.copyFileURLtoWorkspaceCommand';

export const DIDACT_OUTPUT_CHANNEL = 'Didact Activity';

// stash the extension context for use by the commands
export function initializeContext(inContext: vscode.ExtensionContext) {
	extensionFunctions.setContext(inContext);
	utils.setContext(inContext);

	// set up the didact output channel
	didactOutputChannel = vscode.window.createOutputChannel(DIDACT_OUTPUT_CHANNEL);
}

// contain all the various command functions in one spot
export namespace extensionFunctions {

	// stashed extension context
	let context : vscode.ExtensionContext;

	// stashed Didact URI
	let _didactFileUri : vscode.Uri | undefined = undefined;

	// stash the context so we have it for use by the command functions without passing it each time
	export function setContext(inContext: vscode.ExtensionContext) {
		context = inContext;
	}

	// exposed for testing purposes
	export function getContext() : vscode.ExtensionContext {
		return context;
	}

	// use the json to model the folder/file structure to be created in the vscode workspace
	export async function scaffoldProjectFromJson(jsonpath:vscode.Uri) {
		sendTextToOutputChannel(`Scaffolding project from json: ${jsonpath}`);
		if (utils.getWorkspacePath()) {
			let testJson : any;
			if (jsonpath) {
				var jsoncontent = fs.readFileSync(jsonpath.fsPath, 'utf8');
				testJson = JSON.parse(jsoncontent);
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
		sendTextToOutputChannel(`Creating temporary folder as workspace root`);
		var tmp = require('tmp');
		// if the workspace is empty, we will create a temporary one for the user
		var tmpobj = tmp.dirSync();
		let rootUri : vscode.Uri = vscode.Uri.parse(`file://${tmpobj.name}`);
		vscode.workspace.updateWorkspaceFolders(0,undefined, {uri: rootUri});
		sendTextToOutputChannel(`-- created ${tmpobj.name}`);
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
						name = arg;
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
			sendTextToOutputChannel(`Starting terminal ${name} with uri ${uri}`);
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

	async function showAndSendCtrlC(terminal: vscode.Terminal) {
		if (terminal) {
			terminal.show();
			await vscode.commands.executeCommand("workbench.action.terminal.sendSequence", { text : "\x03" });
			return;
		}
	}

	async function killTerminal(terminal: vscode.Terminal) {
		if (terminal) {
			terminal.show();
			await vscode.commands.executeCommand("workbench.action.terminal.kill");
			return;
		}
	}

	export function findTerminal(name: string) : vscode.Terminal | undefined {
		try {
			for(let localTerm of vscode.window.terminals){
				if(localTerm.name === name){
					return localTerm;
				}
			}
		} catch {
			return undefined;
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
		sendTextToOutputChannel(`Sent terminal ${name} the text ${text}`);
	}

	export async function sendTerminalCtrlC(name:string) {
		const terminal : vscode.Terminal | undefined = findTerminal(name);
		if (!terminal) {
			throw new Error(`No terminal found with name ${name} to send a Ctrl+C`);
		} else {
			showAndSendCtrlC(terminal);
			sendTextToOutputChannel(`Sent terminal ${name} a Ctrl+C`);
		}
	}

	export async function closeTerminal(name:string) {
		const terminal : vscode.Terminal | undefined = findTerminal(name);
		if (!terminal) {
			throw new Error(`No terminal found with name ${name} to close`);
		} else {
			await killTerminal(terminal).then( () => {
				if (terminal) {
					terminal.dispose();
				}
			});
			sendTextToOutputChannel(`Closed terminal ${name}`);
		}
	}

	// reset the didact window to use the default set in the settings
	export async function openDidactWithDefault() {
		sendTextToOutputChannel(`Starting Didact window with default`);
		// TODO: add Didact document path here?
		DidactWebviewPanel.createOrShow(context.extensionPath);
		DidactWebviewPanel.setContext(context);
		_didactFileUri = undefined;
		DidactWebviewPanel.hardReset();
	}

	export function handleVSCodeDidactUriParsingForPath(uri:vscode.Uri) : vscode.Uri | undefined {
		let out : vscode.Uri | undefined = undefined;

		// handle extension, workspace, https, and http
		if (uri) {
			const query = querystring.parse(uri.query);
			if (query.extension) {
				const value = utils.getValue(query.extension);
				if (value) {
					let extUri = handleExtFilePath(value);
					if (extUri) {
						return extUri;
					} else if (context.extensionPath === undefined) {
						return undefined;
					}
					out = vscode.Uri.file(
						path.join(context.extensionPath, value)
					);
				}
			} else if (query.workspace) {
				const value = utils.getValue(query.workspace);
				if (value) {
					if (vscode.workspace.workspaceFolders) {
						var workspace = vscode.workspace.workspaceFolders[0];
						let rootPath = workspace.uri.fsPath;
						out = vscode.Uri.file(path.join(rootPath, value));
					}
				}
			} else if (query.https) {
				const value = utils.getValue(query.https);
				if (value) {
					out = vscode.Uri.parse(`https://${value}`);
				}
			} else if (query.http) {
				const value = utils.getValue(query.http);
				if (value) {
					out = vscode.Uri.parse(`http://${value}`);
				}
			} else if (uri.fsPath) {
				out = uri;
			} else {
				out = vscode.Uri.parse(uri.toString());
			}
		}
		return out;
	}

	// open the didact window with the didact file passed in via Uri
	export async function startDidact(uri:vscode.Uri, viewColumn?: string) {
		if (!uri) {
			uri = await utils.getCurrentFileSelectionPath();
		}

		// if column passed, convert to viewcolumn enum
		let actualColumn : vscode.ViewColumn = vscode.ViewColumn.Active;
		if (viewColumn) {
			actualColumn = (<any>vscode.ViewColumn)[viewColumn];
		}
		sendTextToOutputChannel(`Starting Didact window with ${uri}`);

		let out : vscode.Uri | undefined = handleVSCodeDidactUriParsingForPath(uri);
		if (!out) {
			let errmsg = `--Error: No Didact file found when parsing URI ${uri}`;
			sendTextToOutputChannel(errmsg);
			vscode.window.showErrorMessage(errmsg);
			return;
		} else {
			_didactFileUri = out;
		}
		console.log(`--Retrieved file URI ${_didactFileUri}`);
		sendTextToOutputChannel(`--Retrieved file URI ${_didactFileUri}`);
		const isAdoc = extensionFunctions.isAsciiDoc();
		DidactWebviewPanel.createOrShow(context.extensionPath, _didactFileUri, actualColumn);
		DidactWebviewPanel.setContext(context);
		if (DidactWebviewPanel.currentPanel && _didactFileUri) {
			DidactWebviewPanel.currentPanel.setIsAsciiDoc(isAdoc);
			DidactWebviewPanel.currentPanel.setDidactUriPath(_didactFileUri);
		}
	}

	// very basic requirements testing -- check to see if the results of a command executed at CLI returns a known result
	// example: testCommand = mvn --version, testResult = 'Apache Maven'
	export async function requirementCheck(requirement: string, testCommand: string, testResult: string) : Promise<boolean> {
		try {
			sendTextToOutputChannel(`Validating requirement ${testCommand} exists in VS Code workbench`);
			let result = child_process.execSync(testCommand);
			if (result.includes(testResult)) {
				sendTextToOutputChannel(`--Requirement ${testCommand} exists in VS Code workbench: true`);
				postRequirementsResponseMessage(requirement, true);
				return true;
			} else {
				sendTextToOutputChannel(`--Requirement ${testCommand} exists in VS Code workbench: false`);
				postRequirementsResponseMessage(requirement, false);
				return false;
			}
		} catch (error) {
			sendTextToOutputChannel(`--Requirement ${testCommand} exists in VS Code workbench: false`);
			postRequirementsResponseMessage(requirement, false);
		}
		return false;
	}

	// even more basic CLI check - tests to see if CLI command returns zero meaning it executed successfully
	export async function cliExecutionCheck(requirement: string, testCommand: string) : Promise<boolean> {
		try {
			sendTextToOutputChannel(`Validating requirement ${testCommand} exists in VS Code workbench`);
			var options = {
				timeout: 15000 // adding timeout for network calls
			  };
			  
			let result = child_process.execSync(testCommand, options);
			if (result) {
				sendTextToOutputChannel(`--CLI command ${testCommand} returned code 0 and result ${result.toString()}`);
				postRequirementsResponseMessage(requirement, true);
				return true;
			}
		} catch (error) {
			sendTextToOutputChannel(`--CLI command ${testCommand} failed with error ${error.status}`);
			postRequirementsResponseMessage(requirement, false);
		}
		return false;
	}

	// very basic requirements testing -- check to see if the extension Id is installed in the user workspace
	export async function extensionCheck(requirement: string, extensionId: string) : Promise<boolean> {
		sendTextToOutputChannel(`Validating extension ${extensionId} exists in VS Code workbench`);
		let testExt = vscode.extensions.getExtension(extensionId);
		if (testExt) {
			sendTextToOutputChannel(`--Extension ${extensionId} exists in VS Code workbench: true`);
			postRequirementsResponseMessage(requirement, true);
			return true;
		} else {
			sendTextToOutputChannel(`--Extension ${extensionId} exists in VS Code workbench: false`);
			postRequirementsResponseMessage(requirement, false);
			return false;
		}
	}

	// very basic test -- check to see if the workspace has at least one root folder
	export async function validWorkspaceCheck(requirement: string) : Promise<boolean> {
		sendTextToOutputChannel(`Validating workspace has at least one root folder`);
		let wsPath = utils.getWorkspacePath();
		if (wsPath) {
			sendTextToOutputChannel(`--Workspace has at least one root folder: true`);
			postRequirementsResponseMessage(requirement, true);
			return true;
		} else {
			sendTextToOutputChannel(`--Workspace has at least one root folder: false`);
			postRequirementsResponseMessage(requirement, false);
			return false;
		}
	}

	// dispose of and reload the didact window with the latest Uri
	export async function reloadDidact() {
		sendTextToOutputChannel(`Reloading Didact window`);
		if (DidactWebviewPanel.currentPanel) {
			DidactWebviewPanel.currentPanel.dispose();
		}
		await vscode.commands.executeCommand(START_DIDACT_COMMAND, _didactFileUri);
	}

	// send a message back to the webview - used for requirements testing mostly
	function postRequirementsResponseMessage(requirement: string, booleanResponse: boolean) {
		if (requirement && DidactWebviewPanel.currentPanel) {
			DidactWebviewPanel.postRequirementsResponseMessage(requirement, booleanResponse);
		}
	}

	function showFileUnavailable(error : any) {
		if (_didactFileUri) {
			vscode.window.showErrorMessage(`File at ${_didactFileUri.toString()} is unavailable`);
		}
		console.log(error);
	}

	// retrieve the didact content to render as HTML
	export async function getWebviewContent() : Promise<string|void> {
		if (!_didactFileUri) {
			const configuredUri : string | undefined = vscode.workspace.getConfiguration().get('didact.defaultUrl');
			if (configuredUri) {
				_didactFileUri = vscode.Uri.parse(configuredUri);
			}
		}
		if (_didactFileUri) {
			if (_didactFileUri.scheme === 'file') {
				return await getDataFromFile(_didactFileUri).catch( (error) => {
					showFileUnavailable(error);
				});
			} else if (_didactFileUri.scheme === 'http' || _didactFileUri.scheme === 'https'){
				const urlToFetch = _didactFileUri.toString();
				return await getDataFromUrl(urlToFetch).catch( (error) => {
					showFileUnavailable(error);
				});
			}
		}
		return undefined;
	}

	export function isAsciiDoc() : boolean {
		let uriToTest : vscode.Uri | undefined;
		if (!_didactFileUri) {
			let strToTest : string | undefined = vscode.workspace.getConfiguration().get('didact.defaultUrl');
			if (strToTest) {
				uriToTest = vscode.Uri.parse(strToTest);
			}
		} else {
			uriToTest = _didactFileUri;
		}
		if (uriToTest && uriToTest.fsPath) {
			const extname = path.extname(uriToTest.fsPath);
			if (extname.localeCompare('.adoc') === 0) {
				return true;
			}
		}
		return false;
	}

	// retrieve didact text from a file
	async function getDataFromFile(uri:vscode.Uri) : Promise<string|undefined> {
		try {
			const content = fs.readFileSync(uri.fsPath, 'utf8');
			const extname = path.extname(uri.fsPath);
			let result : string;
			if (extname.localeCompare('.adoc') === 0) {
				result = parseADtoHTML(content);
				return result;
			} else if (extname.localeCompare('.md') === 0) {
				const parser = getMDParser();
				result = parser.render(content);
				return result;
			}
		} catch (error) {
			throw new Error(error);
		}
	}

	// retrieve didact text from a url
	async function getDataFromUrl(inurl:string) : Promise<string> {
		try {
			const response = await fetch(inurl);
			const content = await response.text();
			const parser = getMDParser();
			const result = parser.render(content);
			return result;
		} catch (error) {
			throw new Error(error);
		}
	}

	export function validateAllRequirements() {
		if (DidactWebviewPanel.currentPanel) {
			sendTextToOutputChannel(`Validating all requirements specified in Didact tutorial`);
			DidactWebviewPanel.postTestAllRequirementsMessage();
		}
	}

	const commandPrefix = 'didact://?commandId';

	function collectElements(tagname: string) : any[] {
		var elements:any[] = [];
		if (DidactWebviewPanel.currentPanel) {
			let html : string | undefined = DidactWebviewPanel.currentPanel.getCurrentHTML();
			if (html) {
				var document = new DOMParser().parseFromString(html, 'text/html');
				var links = document.getElementsByTagName(tagname);
				for (let index = 0; index < links.length; index++) {
					const element = links[index];
					elements.push(element);
				}
			}
		}
		return elements;
	}

	// note that this MUST be also updated in the main.js file 
	const requirementCommandLinks = [
		'didact://?commandId=vscode.didact.extensionRequirementCheck',
		'didact://?commandId=vscode.didact.requirementCheck',
		'didact://?commandId=vscode.didact.workspaceFolderExistsCheck',
		'didact://?commandId=vscode.didact.cliCommandSuccessful'
	];

	export function gatherAllRequirementsLinks() : any[] {
		var requirements = [];
		if (DidactWebviewPanel.currentPanel) {
			var links = collectElements("a");
			for (let index = 0; index < links.length; index++) {
				const element = links[index];
				if (element.getAttribute('href')) {
					const href = element.getAttribute('href');
					for(let check of requirementCommandLinks) {
						if (href.startsWith(check)) {
							requirements.push(href);
							break;
						}
					}
				}
			}
		}
		return requirements;
	}

	export function gatherAllCommandsLinks() {
		var commandLinks = [];
		if (DidactWebviewPanel.currentPanel) {
			var links = collectElements("a");
			for (let index = 0; index < links.length; index++) {
				const element = links[index];
				if (element.getAttribute('href')) {
					const href = element.getAttribute('href');
					if (href.startsWith(commandPrefix)) {
						commandLinks.push(href);
					}
				}
			}
		}
		return commandLinks;
	}

	export async function openTutorialFromView(node: TreeNode) : Promise<void> {
		if (node && node.uri) {
			sendTextToOutputChannel(`Opening tutorial from Didact view (${node.uri})`);
			let vsUri = vscode.Uri.parse(node.uri);
			await startDidact(vsUri);
		}
	}

	export async function registerTutorial(name : string, sourceUri : string, category : string) : Promise<void> {
		return new Promise<void>( (resolve, reject) => {
			sendTextToOutputChannel(`Registering Didact tutorial with name (${name}), category (${category}, and sourceUri (${sourceUri})`);
			utils.registerTutorial(name, sourceUri, category).then( () => {
				resolve();
				return;
			}).catch ( (error) => {
				reject(error);
				return;
			});
		});
	}

	export async function sendTextToOutputChannel(msg: string, channel?: vscode.OutputChannel) : Promise<void> {
		// set up the didact output channel if it's not set up
		if (!didactOutputChannel) {
			didactOutputChannel = vscode.window.createOutputChannel(DIDACT_OUTPUT_CHANNEL);
		}

		if (!channel && didactOutputChannel) {
			channel = didactOutputChannel;
		}
		if (channel) {
			if (!msg.endsWith('\n')) {
				msg = `${msg} \n`;
			}
			channel.append(msg);
		} else {
			console.log('[' + msg + ']');
		}
	}

	async function openDidactOutputChannel() : Promise<void> {
		if (!didactOutputChannel) {
			didactOutputChannel = vscode.window.createOutputChannel(DIDACT_OUTPUT_CHANNEL);
		}
		didactOutputChannel.show();
	}

	// exported for testing
	export async function validateDidactCommands(commands : any[]) : Promise<boolean> {
		let allOk = true;
		if (commands && commands.length > 0) {
			sendTextToOutputChannel(`Starting validation...`);
			const vsCommands : string[] = await vscode.commands.getCommands(true);
			for(let command of commands) {
				// validate all commands we found
				const parsedUrl = url.parse(command, true);
				const query = parsedUrl.query;
				if (query.commandId) {
					const commandId = utils.getValue(query.commandId);
					if (commandId) {
						let foundCommand = validateCommand(commandId, vsCommands);
						if (foundCommand) {
							// expected result - we found the command in the vscode command list
						} else {
							// unexpected result - let the user know
							sendTextToOutputChannel(`--Missing Command ID ${commandId}.`);
							allOk = false;
						}
					}
				}
			}
		}
		return allOk;
	}

	// exported for testing
	export function validateCommand(commandId:string, vsCommands:string[]) : boolean {
		if (commandId) {
			var foundCommand : string | undefined = vsCommands.find( function (command) {
				return command === commandId;
			});
			if (foundCommand) {
				return true;
			}
		}
		return false;
	}

	export async function validateCommandIDsInSelectedFile(didactUri: vscode.Uri) : Promise<void> {
		if (didactUri) {
			await vscode.commands.executeCommand(START_DIDACT_COMMAND, didactUri);
		}
		if (DidactWebviewPanel.currentPanel) {
			const commands : any[] = extensionFunctions.gatherAllCommandsLinks();
			let allOk = false;
			await openDidactOutputChannel();
			if (commands && commands.length > 0) {
				allOk = await validateDidactCommands(commands);
				if (allOk) {
					sendTextToOutputChannel(`--Command IDs: OK`);
					sendTextToOutputChannel(`Validation Result: SUCCESS (${commands.length} Commands Validated)`);
				} else {
					sendTextToOutputChannel(`Validation Result: FAILURE`);
					sendTextToOutputChannel(`-- Note that command IDs not found may be due to a missing extension or simply an invalid ID.`);
				}
			} else {
				sendTextToOutputChannel(`Validation Result: FAILURE - No command IDs found in current Didact file`);
			}
		}
	}

	export async function placeTextOnClipboard(clipText : string ) {
		await vscode.env.clipboard.writeText(clipText).then( () => {
			sendTextToOutputChannel(`Text sent to clipboard: "${clipText}"`);
		});
	}

	// exported for testing
	export async function downloadAndUnzipFile(httpFileUrl : string, installFolder : string, dlFilename? : string, extractFlag = false, ignoreOverwrite = false) : Promise<any> {
		let filename : string = '';
		if (!dlFilename) {
			var fileUrl = url.parse(httpFileUrl);
			var pathname = fileUrl.pathname;
			if (pathname) {
				filename = pathname.substring(pathname.lastIndexOf('/')+1);
			}
		} else {
			filename = dlFilename;
		}

		const downloadFile : string = path.join(installFolder, filename);
		let overwriteFile : boolean = false;
		if (extractFlag && !ignoreOverwrite) {
			const answer = await vscode.window.showQuickPick([
				'Yes',
				'No'
			], {
				canPickMany: false,
				placeHolder: `The archive ${filename} may overwrite folders and files in the workspace. Are you sure?`
			});
			if (answer === 'No') {
				sendTextToOutputChannel(`Copy and unzip of file ${filename} was canceled.`);
				return null;
			}
			if (answer === 'Yes') {
				overwriteFile = true;
			}
		} else if (!extractFlag && !ignoreOverwrite) {
			try {
				let pathUri = vscode.Uri.parse(downloadFile);
				try {
					let contents = await vscode.workspace.fs.readFile(pathUri);
					if (contents) {
						const answer = await vscode.window.showQuickPick([
							'Yes',
							'No'
						], {
							canPickMany: false,
							placeHolder: `The file ${filename} already exists. Do you want to overwrite it?`
						});
						if (answer === 'No') {
							sendTextToOutputChannel(`Copy of file ${filename} was canceled.`);
							return null;
						}
						if (answer === 'Yes') {
							overwriteFile = true;
						}
					} else {
						overwriteFile = true; // file doesn't exist
					}
				} catch (error) {
					// ignore error, it means the file does not exist
					overwriteFile = true;
				}
			} catch (error) {
				// ignore error, it means the file does not exist
				overwriteFile = true;
			}
		}

		if (overwriteFile || ignoreOverwrite) {
			try {
				const downloadResult: boolean = await downloadAndExtract(httpFileUrl, installFolder, filename, extractFlag);
				console.log(`Downloaded ${downloadFile} : ${downloadResult}`);
				sendTextToOutputChannel(`Downloaded ${downloadFile}`);
				return downloadFile;
			} catch ( error ) {
				console.log(error);
				sendTextToOutputChannel(`Failed to download file: ${error}`);
				return error;
			}
		}
	}

	export async function copyFileFromURLtoLocalURI(httpurl : any, fileName? : string, fileuri? : string, unzip = false) {
		let filepathUri : vscode.Uri | undefined;
		let projectFilePath : string = '';

		if (fileuri && fileuri.length > 0) {
			projectFilePath = fileuri.trim();
		}
		let dlFileName = '';
		if (fileName) {
			dlFileName = fileName;
		}

		filepathUri = handleProjectFilePath(projectFilePath);
		if (filepathUri) {
			await downloadAndUnzipFile(httpurl, filepathUri.fsPath, dlFileName, unzip);
		}
	}

	async function downloadAndExtract(link : string, installFolder : string, dlFilename? : string, extractFlag?: boolean) : Promise<boolean> {
		let myStatusBarItem: vscode.StatusBarItem;
		myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	
		let downloadSettings;
		if (dlFilename) {
			downloadSettings = {
				filename: `${dlFilename}`,
				extract: extractFlag
			};
		} else {
			downloadSettings = {
				extract: extractFlag
			};
		}

		sendTextToOutputChannel('Downloading from: ' + link);
		await download(link, installFolder, downloadSettings)
			.on('response', (response) => {
				sendTextToOutputChannel(`Bytes to transfer: ${response.headers['content-length']}`);
			}).on('downloadProgress', (progress) => {
				let incr = progress.total > 0 ? Math.floor(progress.transferred / progress.total * 100) : 0;
				let percent = Math.round(incr);
				let message = `Download progress: ${progress.transferred} / ${progress.total} (${percent}%)`;
				let tooltip = `Download progress for ${installFolder}`;
				updateStatusBarItem(myStatusBarItem, message, tooltip);
			}).then(async () => {
				myStatusBarItem.dispose();
				return true;
			}).catch((error) => {
				console.log(error);
			});
		myStatusBarItem.dispose();
		return false;
	}
	
	function updateStatusBarItem(sbItem : vscode.StatusBarItem, text: string, tooltip : string): void {
		if (text) {
			sbItem.text = text;
			sbItem.tooltip = tooltip;
			sbItem.show();
		} else {
			sbItem.hide();
		}
	}	
}
