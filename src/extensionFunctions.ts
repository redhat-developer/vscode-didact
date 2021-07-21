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
import * as fs from 'fs';
import * as querystring from 'querystring';
import * as path from 'path';
import * as child_process from 'child_process';
import {parseMDtoHTML} from './markdownUtils';
import {parseADtoHTML} from './asciidocUtils';
import * as scaffoldUtils from './scaffoldUtils';
import { TreeNode } from './nodeProvider';
import { handleExtFilePath, handleProjectFilePath } from './commandHandler';
import * as download from 'download';
import { didactManager } from './didactManager';
import { parse } from 'node-html-parser';
import { addNewTutorialWithNameAndCategoryForDidactUri, delay, getCachedOutputChannel, getCurrentFileSelectionPath, getDefaultUrl, getInsertLFForCLILinkSetting, getLinkTextForCLILinkSetting, getValue, getWorkspacePath, registerTutorialWithCategory, rememberOutputChannel } from './utils';
import { getYamlContent } from './yamlUtils';

const tmp = require('tmp');
const fetch = require('node-fetch');
const url = require('url-parse');

// command IDs
export const SCAFFOLD_PROJECT_COMMAND = 'vscode.didact.scaffoldProject';
export const OPEN_TUTORIAL_COMMAND = 'vscode.didact.openTutorial';
export const START_DIDACT_COMMAND = 'vscode.didact.startDidact';
export const START_TERMINAL_COMMAND = 'vscode.didact.startTerminalWithName';
export const SEND_TERMINAL_SOME_TEXT_COMMAND = 'vscode.didact.sendNamedTerminalAString';
export const SEND_TERMINAL_SOME_TEXT_COMMAND_NO_LF = 'vscode.didact.sendNamedTerminalAStringNoLF';
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
export const OPEN_NAMED_OUTPUTCHANNEL_COMMAND = 'vscode.didact.openNamedOutputChannel';
export const SEND_TO_NAMED_OUTPUTCHANNEL_COMMAND = 'vscode.didact.sendTextToNamedOutputChannel';
export const VALIDATE_COMMAND_IDS = 'vscode.didact.verifyCommands';
export const TEXT_TO_CLIPBOARD_COMMAND = 'vscode.didact.copyToClipboardCommand';
export const COPY_FILE_URL_TO_WORKSPACE_COMMAND = 'vscode.didact.copyFileURLtoWorkspaceCommand';
export const DIDACT_OUTPUT_CHANNEL = 'Didact Activity';
export const FILE_TO_CLIPBOARD_COMMAND = 'vscode.didact.copyFileTextToClipboardCommand';
export const PASTE_TO_ACTIVE_EDITOR_COMMAND = 'vscode.didact.copyClipboardToActiveTextEditor';
export const PASTE_TO_EDITOR_FOR_FILE_COMMAND = 'vscode.didact.copyClipboardToEditorForFile';
export const PASTE_TO_NEW_FILE_COMMAND = 'vscode.didact.copyClipboardToNewFile';
export const REFRESH_DIDACT = 'vscode.didact.refresh';
export const CLEAR_DIDACT_REGISTRY = 'vscode.didact.registry.clear';
export const ADD_TUTORIAL_TO_REGISTRY = 'vscode.didact.registry.addJson';
export const ADD_TUTORIAL_URI_TO_REGISTRY = 'vscode.didact.registry.addUri';
export const REMOVE_TUTORIAL_BY_NAME_AND_CATEGORY_FROM_REGISTRY = 'vscode.didact.view.tutorial.remove';
export const OPEN_TUTORIAL_HEADING_FROM_VIEW = "vscode.didact.view.tutorial.heading.open";
export const PROCESS_VSCODE_LINK = "vscode.didact.processVSCodeLink";
export const CREATE_SEND_TO_TERMINAL_LINK_FROM_SELECTED_TEXT = "vscode.didact.copyTextToCLI";
export const OPEN_URI_WITH_LINE_AND_OR_COLUMN = "vscode.didact.openUriWithLineAndOrColumn";

export const EXTENSION_ID = "redhat.vscode-didact";

const commandPrefix = 'didact://?commandId';
// note that this MUST be also updated in the main.js file 
const requirementCommandLinks = [
	'didact://?commandId=vscode.didact.extensionRequirementCheck',
	'didact://?commandId=vscode.didact.requirementCheck',
	'didact://?commandId=vscode.didact.workspaceFolderExistsCheck',
	'didact://?commandId=vscode.didact.cliCommandSuccessful'
];

type StringVoidUndefinedTypeAlias = string | void | undefined;

// stashed extension context
let extContext : vscode.ExtensionContext;

export let didactOutputChannel: vscode.OutputChannel;

// stashed Didact URI
let _didactFileUri : vscode.Uri | undefined = undefined;

// exposed for testing purposes
export function getContext() : vscode.ExtensionContext {
	return extContext;
}

export function initialize(inContext: vscode.ExtensionContext): void {
	extContext = inContext;
	// set up the didact output channel
	didactOutputChannel = vscode.window.createOutputChannel(DIDACT_OUTPUT_CHANNEL);
}

// use the json to model the folder/file structure to be created in the vscode workspace
export async function scaffoldProjectFromJson(jsonpath:vscode.Uri): Promise<void> {
	sendTextToOutputChannel(`Scaffolding project from json: ${jsonpath}`);
	if (getWorkspacePath()) {
		let testJson : any;
		if (jsonpath) {
			const jsoncontent = fs.readFileSync(jsonpath.fsPath, 'utf8');
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
export async function createTemporaryFolderAsWorkspaceRoot(requirement: string | undefined): Promise<void> {
	sendTextToOutputChannel(`Creating temporary folder as workspace root`);
	
	// if the workspace is empty, we will create a temporary one for the user
	const tmpobj = tmp.dirSync();
	const rootUri : vscode.Uri = vscode.Uri.file(`${tmpobj.name}`);
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
export async function startTerminal(...rest: any[]): Promise<void>{ //name:string, path: vscode.Uri) {
	let name : string | undefined = undefined;
	let uri : vscode.Uri | undefined = undefined;
	if (rest) {
		try {
			for(const arg of rest) {
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
		const oldTerm = findTerminal(name);
		if (oldTerm) {
			oldTerm.show();
			return;
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

export async function showAndSendText(terminal: vscode.Terminal, text:string, sendLF = true): Promise<void> {
	if (terminal) {
		terminal.show();
		terminal.sendText(text, sendLF);
	}
}

export async function showAndSendCtrlC(terminal: vscode.Terminal): Promise<void>{
	if (terminal) {
		terminal.show();
		await vscode.commands.executeCommand("workbench.action.terminal.sendSequence", { text : "\x03" });
	}
}

export async function killTerminal(terminal: vscode.Terminal): Promise<void>{
	if (terminal) {
		terminal.show();
		await vscode.commands.executeCommand("workbench.action.terminal.kill");
	}
}

export function findTerminal(name: string) : vscode.Terminal | undefined {
	try {
		for(const localTerm of vscode.window.terminals){
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
export async function sendTerminalText(name:string, text:string, sendLF = true): Promise<void> {
	let terminal : vscode.Terminal | undefined = findTerminal(name);
	if (!terminal) {
		terminal = vscode.window.createTerminal(name);
	}
	if (terminal) {
		showAndSendText(terminal, text, sendLF);
	}
	const msg = `Sent terminal ${name} the text ${text}`;
	if (sendLF) {
		sendTextToOutputChannel(msg + ` with LF`);
	} else {
		sendTextToOutputChannel(msg);
	}
}

export async function sendTerminalTextNoLF(name:string, text:string): Promise<void> {
	return sendTerminalText(name, text, false);
}

export async function sendTerminalCtrlC(name:string): Promise<void> {
	const terminal : vscode.Terminal | undefined = findTerminal(name);
	if (!terminal) {
		throw new Error(`No terminal found with name ${name} to send a Ctrl+C`);
	} else {
		showAndSendCtrlC(terminal);
		sendTextToOutputChannel(`Sent terminal ${name} a Ctrl+C`);
	}
}

export async function closeTerminal(name:string): Promise<void>{
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
export async function openDidactWithDefault(this: any): Promise<void>{
	sendTextToOutputChannel(`Starting Didact window with default`);

	didactManager.setContext(extContext);
	const configuredPath : string | undefined = getDefaultUrl();
	if (configuredPath) {
		try {
			const vsUri = vscode.Uri.parse(configuredPath);
			if (vsUri) {
				_didactFileUri = vsUri;
			}
		} catch (error) {
			console.log(error);
		}
	}
	if (_didactFileUri) {
		await didactManager.create(_didactFileUri);
	} else {
		const errStr = `No default didact URL provided when opening default tutorial. Check setting to ensure path is provided.`;
		sendTextToOutputChannel(errStr);
		vscode.window.showErrorMessage(errStr);
	}
}

function processExtensionFilePath(value: string | undefined) : vscode.Uri | undefined {
	if (value) {
		const extUri = handleExtFilePath(value);
		if (extUri) {
			return extUri;
		} else if (extContext.extensionPath === undefined) {
			return undefined;
		}
		return vscode.Uri.file(
			path.resolve(extContext.extensionPath, value)
		);
	}
	return undefined;
}

export function handleVSCodeDidactUriParsingForPath(uri:vscode.Uri) : vscode.Uri | undefined {
	let out : vscode.Uri | undefined = undefined;

	// handle extension/extFilePath, workspace, https, and http
	if (uri) {
		const query = querystring.parse(uri.query);
		if (query.extension) {
			const value = getValue(query.extension);
			out = processExtensionFilePath(value);
		} else if (query.extFilePath) {
			const value = getValue(query.extFilePath);
			out = processExtensionFilePath(value);
		} else if (query.workspace) {
			const value = getValue(query.workspace);
			if (value) {
				if (vscode.workspace.workspaceFolders) {
					const workspace = vscode.workspace.workspaceFolders[0];
					const rootPath = workspace.uri.fsPath;
					out = vscode.Uri.file(path.resolve(rootPath, value));
				}
			}
		} else if (query.https) {
			const value = getValue(query.https);
			if (value) {
				out = vscode.Uri.parse(`https://${value}`);
			}
		} else if (query.http) {
			const value = getValue(query.http);
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

export async function revealOrStartDidactByURI(uri : vscode.Uri, viewColumn? : string) : Promise <void> {
	if (!uri) {
		uri = await getCurrentFileSelectionPath();
	}
	if (uri) {
		const parentPanel = didactManager.getByUri(uri);
		if (parentPanel) {
			parentPanel._panel?.reveal();
			await parentPanel.refreshPanel();
		} else {
			await startDidact(uri, viewColumn);
		}
	}	
}

// open the didact window with the didact file passed in via Uri
export async function startDidact(uri: vscode.Uri, viewColumn?: string): Promise<void>{
	if (!uri) {
		uri = await getCurrentFileSelectionPath();
	}

	// if column passed, convert to viewcolumn enum
	let actualColumn : vscode.ViewColumn = vscode.ViewColumn.Active;
	if (viewColumn) {
		actualColumn = (<any>vscode.ViewColumn)[viewColumn];
	}
	sendTextToOutputChannel(`Starting Didact window with ${uri}`);

	const out : vscode.Uri | undefined = handleVSCodeDidactUriParsingForPath(uri);
	if (!out) {
		const errmsg = `--Error: No Didact file found when parsing URI ${uri}`;
		sendTextToOutputChannel(errmsg);
		vscode.window.showErrorMessage(errmsg);
		return;
	} else {
		_didactFileUri = out;
	}
	console.log(`--Retrieved file URI ${_didactFileUri}`);
	sendTextToOutputChannel(`--Retrieved file URI ${_didactFileUri}`);

	didactManager.setContext(extContext);
	await didactManager.create(_didactFileUri, actualColumn);
}

// very basic requirements testing -- check to see if the results of a command executed at CLI returns a known result
// example: testCommand = mvn --version, testResult = 'Apache Maven'
export async function requirementCheck(requirement: string, testCommand: string, testResult: string) : Promise<boolean> {
	try {
		sendTextToOutputChannel(`Validating requirement ${testCommand} exists in VS Code workbench`);
		const result = child_process.execSync(testCommand);
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
		const options = {
			timeout: 15000 // adding timeout for network calls
		};

		const result = child_process.execSync(testCommand, options);
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
	const testExt = vscode.extensions.getExtension(extensionId);
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
	const wsPath = getWorkspacePath();
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
export async function reloadDidact(): Promise<void>{
	sendTextToOutputChannel(`Reloading Didact window`);
	didactManager.active()?.dispose();
	await vscode.commands.executeCommand(START_DIDACT_COMMAND, _didactFileUri);
}

export async function refreshDidactWindow(): Promise<void>{
	sendTextToOutputChannel(`Refreshing Didact window`);
	await didactManager.active()?.refreshPanel();
}

// send a message back to the webview - used for requirements testing mostly
function postRequirementsResponseMessage(requirement: string, booleanResponse: boolean): void {
	if (requirement) {
		didactManager.active()?.postRequirementsResponseMessage(requirement, booleanResponse);
	}
}

function showFileUnavailable(error : any): void {
	if (_didactFileUri) {
		vscode.window.showErrorMessage(`File at ${_didactFileUri.toString()} is unavailable`);
	}
	console.log(error);
}

// retrieve the didact content to render as HTML
export async function getWebviewContent() : Promise<string|void> {
	if (!_didactFileUri) {
		const configuredUri : string | undefined = getDefaultUrl();
		if (configuredUri) {
			_didactFileUri = vscode.Uri.parse(configuredUri);
		}
	}
	if (_didactFileUri) {
		if (_didactFileUri.scheme === 'file') {
			return loadFileWithRetry(_didactFileUri);
		} else if (_didactFileUri.scheme === 'http' || _didactFileUri.scheme === 'https'){
			return loadFileFromHTTPWithRetry(_didactFileUri);
		}
	}
	return undefined;
}

async function loadFileWithRetry ( uri:vscode.Uri ) : Promise<StringVoidUndefinedTypeAlias> {
	return getDataFromFile(uri).catch( async () => {
		await delay(3000);
		return getDataFromFile(uri).catch( async (error) => {
			showFileUnavailable(error);
		});
	});
}

async function loadFileFromHTTPWithRetry ( uri:vscode.Uri ) : Promise<StringVoidUndefinedTypeAlias> {
	const urlToFetch = uri.toString();
	return getDataFromUrl(urlToFetch).catch( async () => {
		await delay(3000);
		return getDataFromUrl(urlToFetch).catch( async (error) => {
			showFileUnavailable(error);
		});
	});
}

export function isAsciiDoc(inUri? : string) : boolean {
	let uriToTest : vscode.Uri | undefined;
	if (inUri) {
		uriToTest = vscode.Uri.parse(inUri);
	} else if (!_didactFileUri) {
		const strToTest : string | undefined = vscode.workspace.getConfiguration().get('didact.defaultUrl');
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

// retrieve didact text from a file - exported for test
export async function getDataFromFile(uri:vscode.Uri) : Promise<string|undefined> {
	try {
		const content = fs.readFileSync(uri.fsPath, 'utf8');
		const extname = path.extname(uri.fsPath);
		if (extname.localeCompare('.adoc') === 0) {
			let baseDir : string | undefined = undefined;
			if (uri.scheme.trim().startsWith('file')) {
				baseDir = path.dirname(uri.fsPath);
			}
			return parseADtoHTML(content, baseDir);
		} else if (extname.localeCompare('.md') === 0) {
			return parseMDtoHTML(content);
		} else if (extname.localeCompare('.yaml') === 0) {
			return getYamlContent(content, uri);
		} else {
			throw new Error(`Unknown file type encountered: ${extname}`);
		}
	} catch (error) {
		throw new Error(error);
	}
}

// retrieve didact text from a url
export async function getDataFromUrl(inurl:string) : Promise<string> {
	try {
		const response = await fetch(inurl);
		const content = await response.text();
		const tempVSUri = vscode.Uri.parse(inurl);
		const extname = path.extname(tempVSUri.fsPath);
		if (extname.localeCompare('.adoc') === 0) {
			return parseADtoHTML(content);
		} else if (extname.localeCompare('.md') === 0) {
			return parseMDtoHTML(content);
		} else if (extname.localeCompare('.yaml') === 0) {
			return getYamlContent(content, tempVSUri);
		} else {
			throw new Error(`Unknown file type encountered: ${extname}`);
		}
	} catch (error) {
		sendTextToOutputChannel(`--getDataFromUrl: error = ${error}`);
		throw new Error(error);
	}
}

export function validateAllRequirements(): void {
	sendTextToOutputChannel(`Validating all requirements specified in Didact tutorial`);
	didactManager.active()?.postTestAllRequirementsMessage();
}

export function collectElements(tagname: string, html? : string | undefined) : any[] {
	const elements: any[] = [];
	if (!html) {
		html = didactManager.active()?.getCurrentHTML();
	}
	if (html) {
		const document = parse(html);
		const links = document.querySelectorAll(tagname);
		for (let element of links.values()) {
			elements.push(element);
		}
	}
	return elements;
}

export function gatherAllRequirementsLinks() : any[] {
	const requirements = [];
	if (didactManager.active()?.getCurrentHTML()) {
		const links = collectElements("a", didactManager.active()?.getCurrentHTML());
		for (let element of links.values()) {
			if (element.getAttribute('href')) {
				const href = element.getAttribute('href');
				for(const check of requirementCommandLinks) {
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

export function gatherAllCommandsLinks(): any[] {
	const commandLinks = [];
	if (didactManager.active()?.getCurrentHTML()) {
		const links = collectElements("a", didactManager.active()?.getCurrentHTML());
		for (let element of links.values()) {
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
		const vsUri = getActualUri(node.uri);
		if (vsUri) {
			await startDidact(vsUri);
		}
	}
}

export async function registerTutorial(name : string, sourceUri : string, category : string) : Promise<void> {
	sendTextToOutputChannel(`Registering Didact tutorial with name (${name}), category (${category}, and sourceUri (${sourceUri})`);
	await registerTutorialWithCategory(name, sourceUri, category);
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

async function  openDidactOutputChannel() : Promise<void> {
	if (!didactOutputChannel) {
		didactOutputChannel = vscode.window.createOutputChannel(DIDACT_OUTPUT_CHANNEL);
	}
	didactOutputChannel.show();
}

// exported for testing
export async function validateDidactCommands(commands : any[], sendToConsole = false) : Promise<boolean> {
	let allOk = true;
	if (commands && commands.length > 0) {
		sendTextToOutputChannel(`Starting validation...`);
		const vsCommands : string[] = await vscode.commands.getCommands(true);
		for(const command of commands) {
			// validate all commands we found
			const parsedUrl = new url(command, true);
			const query = parsedUrl.query;
			if (query.commandId) {
				const commandId = getValue(query.commandId);
				if (commandId) {
					const foundCommand = validateCommand(commandId, vsCommands);
					if (!foundCommand) {
						// unexpected result - let the user know
						const msg = `--Missing Command ID ${commandId}.`;
						if (sendToConsole) {
							console.log(msg);
						} else {
							await sendTextToOutputChannel(msg);
						}
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
		const foundCommand : string | undefined = vsCommands.find( function (command) {
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
	const commands: any[] = gatherAllCommandsLinks();
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

export async function placeTextOnClipboard(clipText: string): Promise<void>{
	await vscode.env.clipboard.writeText(clipText).then( () => {
		sendTextToOutputChannel(`Text sent to clipboard: "${clipText}"`);
	});
}

// exported for testing
export async function downloadAndUnzipFile(httpFileUrl : string, installFolder : string, dlFilename? : string, extractFlag = false, ignoreOverwrite = false): Promise<any> {
	let filename = '';
	if (!dlFilename) {
		const fileUrl = new url(httpFileUrl);
		const pathname = fileUrl.pathname;
		if (pathname) {
			filename = pathname.substring(pathname.lastIndexOf('/')+1);
		}
	} else {
		filename = dlFilename;
	}

	const downloadFile : string = path.resolve(installFolder, filename);
	let overwriteFile = false;
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
			const pathUri = vscode.Uri.file(downloadFile);
			try {
				const contents = await vscode.workspace.fs.readFile(pathUri);
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

export async function copyFileFromURLtoLocalURI(httpurl : any, fileName? : string, fileuri? : string, unzip = false): Promise<void>{
	let projectFilePath = '';

	if (fileuri && fileuri.length > 0) {
		projectFilePath = fileuri.trim();
	}
	let dlFileName = '';
	if (fileName) {
		dlFileName = fileName;
	}

	const filepathUri = handleProjectFilePath(projectFilePath);
	if (filepathUri) {
		await downloadAndUnzipFile(httpurl, filepathUri.fsPath, dlFileName, unzip);
	}
}

async function downloadAndExtract(link : string, installFolder : string, dlFilename? : string, extractFlag?: boolean) : Promise<boolean> {
	const myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);

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
		.on('response', (response: { headers: { [x: string]: any; }; }) => {
			sendTextToOutputChannel(`Bytes to transfer: ${response.headers['content-length']}`);
		}).on('downloadProgress', (progress: { total: number; transferred: number; }) => {
			const incr = progress.total > 0 ? Math.floor(progress.transferred / progress.total * 100) : 0;
			const percent = Math.round(incr);
			const message = `Download progress: ${progress.transferred} / ${progress.total} (${percent}%)`;
			const tooltip = `Download progress for ${installFolder}`;
			updateStatusBarItem(myStatusBarItem, message, tooltip);
		}).then(async () => {
			myStatusBarItem.dispose();
			return true;
		}).catch((error:any) => {
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

export function openNamedOutputChannel(name?: string | undefined): vscode.OutputChannel | undefined {
	let channel: vscode.OutputChannel | undefined;
	if (!name || name === DIDACT_OUTPUT_CHANNEL) {
		if (!didactOutputChannel) {
			didactOutputChannel = vscode.window.createOutputChannel(DIDACT_OUTPUT_CHANNEL);
		}
		channel = didactOutputChannel;
	} else {
		channel = getCachedOutputChannel(name);
		if (!channel) {
			channel = vscode.window.createOutputChannel(name);
			rememberOutputChannel(channel);
		}
	}	
	if (channel) {
		channel.show();
	}
	return channel;
}

export function sendTextToNamedOutputChannel(message: string, channelName?: string): void {
	if (!message){
		throw new Error('There was no text given for the output channel.');
	}
	let channel: vscode.OutputChannel | undefined = didactOutputChannel;
	if (channelName) {
		channel = openNamedOutputChannel(channelName);
	}
	sendTextToOutputChannel(message, channel);
	if (!channelName || channelName === DIDACT_OUTPUT_CHANNEL) {
		didactOutputChannel.show();
	}
}

function showErrorMessage(msg : string) : void {
	sendTextToOutputChannel(msg);
	vscode.window.showErrorMessage(msg);
}

export async function copyFileTextToClipboard(uri: vscode.Uri) : Promise<void> {
	const testUri : vscode.Uri = uri;
	const out : vscode.Uri | undefined = handleVSCodeDidactUriParsingForPath(testUri);
	if (!out) {
		const errmsg = `ERROR: No file found when parsing path ${uri}`;
		showErrorMessage(errmsg);
		throw new Error(errmsg);
	} else {
		let content : string | undefined = undefined;
		if (out.scheme === 'file') {
			try {
				content = fs.readFileSync(out.fsPath, 'utf8');
			} catch(error) {
				showFileUnavailable(error);
			}
		} else if (out.scheme === 'http' || out.scheme === 'https'){
			const urlToFetch = out.toString();
			try {
				const response = await fetch(urlToFetch);
				content = await response.text();
			} catch(error) {
				showFileUnavailable(error);
			}
		} else {
			const errmsg = `ERROR: Unsupported scheme/protocol when parsing path ${uri}`;
			showErrorMessage(errmsg);
			throw new Error(errmsg);
		}
		if (content) {
			await placeTextOnClipboard(content);
		}
	}
} 

export async function pasteClipboardToActiveEditorOrPreviouslyUsedOne() : Promise<void> {
	let currentEditor : vscode.TextEditor | undefined = vscode.window.activeTextEditor;
	if (!currentEditor) {
		await vscode.commands.executeCommand('workbench.action.openPreviousRecentlyUsedEditor');
		currentEditor = vscode.window.activeTextEditor;
	}
	if (currentEditor) {
		const textFromClipboard = await vscode.env.clipboard.readText();
		if (textFromClipboard) {
			await currentEditor.insertSnippet(new vscode.SnippetString(textFromClipboard));
		} else {
			await vscode.window.showWarningMessage(`No text found on clipboard`);
		}
	} else {
		await vscode.window.showWarningMessage(`No active text editor found to paste from clipboard`);
	}
}

export async function findOpenEditorForFileURI(uri: vscode.Uri) : Promise<vscode.TextEditor | undefined> {
	for (let editor of vscode.window.visibleTextEditors.values()) {
		if (editor.document.uri === uri) {
			return editor;
		}
	}
	return undefined;
}

export async function pasteClipboardToEditorForFile(uri: vscode.Uri) : Promise<void> {
	let editorForFile : vscode.TextEditor | undefined = await findOpenEditorForFileURI(uri);
	if (!editorForFile) {
		try {
			await vscode.commands.executeCommand('vscode.open', uri, vscode.ViewColumn.Beside);
			editorForFile = vscode.window.activeTextEditor;
		} catch (error) {
			await vscode.window.showWarningMessage(`No editor found for file ${uri.fsPath}. ${error}`);
			console.log(error);
		}
	}
	if (editorForFile) {
		await pasteClipboardToActiveEditorOrPreviouslyUsedOne();
	} 
}

export async function pasteClipboardToNewTextFile() : Promise<void> {
	await vscode.commands.executeCommand('workbench.action.files.newUntitledFile');
	await pasteClipboardToActiveEditorOrPreviouslyUsedOne();
}

function getTimeElementsForMD(content : string) : any[] {
	return collectElements("[time]", content);
}

function getTimeElementsForAdoc(content : string) : any[] {
	return collectElements("div[class*='time=']", content);
}

function processTimeTotalForMD(content : string) : number {
	let total = 0;
	let elements : any[] = getTimeElementsForMD(content);
	if (elements && elements.length > 0) {
		elements.forEach(element => {
			const timeAttr = element.getAttribute("time");
			if (timeAttr) {
				const timeValue = Number(timeAttr);
				if (!Number.isNaN(timeValue) && timeValue > 0) {
					total += timeValue;
				}
			}
		});
	}
	return total;
}

function processTimeTotalForAdoc(content : string) : number {
	let total = 0;
	let elements : any[] = getTimeElementsForAdoc(content);
	if (elements && elements.length > 0) {
		elements.forEach(element => {
			const classAttr : string = element.getAttribute("class");
			const splitArray : string[] = classAttr.split(' ');
			splitArray.forEach(chunk => {
				if (chunk.startsWith('time=')) {
					const splitTime = chunk.split('=')[1];
					const timeValue = Number(splitTime);
					if (!Number.isNaN(timeValue) && timeValue > 0) {
						total += timeValue;
					}
				}
			});
		});
	}
	return total;
}

export async function computeTimeForDidactFileUri(uri: vscode.Uri) : Promise<number> {
	if (uri) {
		let content : StringVoidUndefinedTypeAlias = undefined;
		if (uri.scheme === 'file') {
			content = await loadFileWithRetry(uri);
		} else if (uri.scheme === 'http' || uri.scheme === 'https'){
			content = await loadFileFromHTTPWithRetry(uri);
		}
		const isAdoc = isAsciiDoc(uri.toString());
		if (content && !isAdoc) {
			return processTimeTotalForMD(content);
		} else if (content && isAdoc) {
			return processTimeTotalForAdoc(content);
		}
	}
	return -1;
}

export async function getTimeElementsForDidactFileUri(uri: vscode.Uri) : Promise<any[] | undefined> {
	if (uri) {
		let content : string | undefined | void = undefined;
		if (uri.scheme === 'file') {
			content = await loadFileWithRetry(uri);
		} else if (uri.scheme === 'http' || uri.scheme === 'https'){
			content = await loadFileFromHTTPWithRetry(uri);
		}
		if (content && !isAsciiDoc(uri.toString())) {
			return getTimeElementsForMD(content);
		} else if (content && isAsciiDoc(uri.toString())) {
			return getTimeElementsForAdoc(content);
		}
	}
	return undefined;
}

export function getActualUri(uriString : string | undefined ) : vscode.Uri | undefined {
	let actualUri : vscode.Uri | undefined;
	if (uriString && !uriString?.startsWith(`http`)) {
		actualUri = vscode.Uri.file(uriString);
	} else if (uriString) {
		actualUri = vscode.Uri.parse(uriString);
	}
	return actualUri;
}

function validateUriHasPath(textToValidate : string) : vscode.Uri | undefined {
	try {
		const uriToValidate = vscode.Uri.parse(textToValidate, true);
		return handleVSCodeDidactUriParsingForPath(uriToValidate);
	} catch (error) {
		// just return
	}
	return undefined;
}

export async function handleVSCodeUri(uri:vscode.Uri | undefined) : Promise<void> {
	let uriToProcess : vscode.Uri | undefined = uri;
	if (!uriToProcess) {
		// try clipboard
		const textFromClipboard = await vscode.env.clipboard.readText();
		const pathFromClipboard = validateUriHasPath(textFromClipboard);
		if (textFromClipboard && pathFromClipboard) {
			uriToProcess = vscode.Uri.parse(textFromClipboard);
		}
		if (!uriToProcess) {
			await vscode.window.showInputBox({prompt: `Paste in the link from the web`}).then((textValueInput) => {
				if (textValueInput && validateUriHasPath(textValueInput)) {
					uriToProcess = vscode.Uri.parse(textValueInput);
				} else {
					const msg = `No parseable Didact file uri discovered in text provided '${textValueInput}'`;
					sendTextToOutputChannel(msg);
					vscode.window.showWarningMessage(msg);
				}
			});
		}
	}
	if (uriToProcess) {
		const query = querystring.parse(uriToProcess.query);
		if (query.commandId && query.commandId === ADD_TUTORIAL_URI_TO_REGISTRY && query.https && query.name && query.category) {
			const out : vscode.Uri | undefined = handleVSCodeDidactUriParsingForPath(uriToProcess);
			if (out) {
				const tutname : string | undefined = getValue(query.name);
				const tutcat : string | undefined = getValue(query.category);
				await addNewTutorialWithNameAndCategoryForDidactUri(out, tutname, tutcat);
			} else {
				const msg = `No parseable Didact file uri discovered in URI sent via vscode link '${uriToProcess.toString()}'`;
				sendTextToOutputChannel(msg);
				vscode.window.showWarningMessage(msg);
			}
		} else {
			await vscode.commands.executeCommand(START_DIDACT_COMMAND, uriToProcess);
		}
	}
}

// for testing purposes
export function getDidactLinkForSelectedText(selectedText : string, isAdoc : boolean) : string {
	const encodedText = encodeURI(selectedText);
	const linkText = getLinkTextForCLILinkSetting();
	const linkUseLF = getInsertLFForCLILinkSetting();
	let commandToUse = 'vscode.didact.sendNamedTerminalAString';
	if(!linkUseLF) {
		commandToUse = 'vscode.didact.sendNamedTerminalAStringNoLF';
	}
	let templatedLink = ` ([${linkText}](didact://?commandId=${commandToUse}&text=newTerminal$$${encodedText}))`;
	if (isAdoc) {
		templatedLink = ` link:didact://?commandId=${commandToUse}&text=newTerminal$$${encodedText}[(${linkText})]`;
	}
	return templatedLink;
}

export async function convertSelectionToCLILinkAndInsertAfterSelection() : Promise<void> {
	const editor = vscode.window.activeTextEditor;
	if (editor) {
		if (!editor.selections || editor.selections.length === 0) {
			vscode.window.showInformationMessage("There is no selected text!");
			return;
		}		
		const selection = vscode.window.activeTextEditor?.selection;
		const selectedText = vscode.window.activeTextEditor?.document.getText(selection);
		if (selectedText && selectedText.trim().length > 0) {
			const isAdoc = isAsciiDoc(editor.document.uri?.toString());
			const templatedLink = getDidactLinkForSelectedText(selectedText, isAdoc);
			await insertTextAtFirstWhitespacePastCurrentSelection(templatedLink);
		}
	}
}

async function insertTextAtFirstWhitespacePastCurrentSelection(replacementText : string) {
	const editor = vscode.window.activeTextEditor;
	if (editor) {
		editor.edit(function (edit) {
			const selection = editor.selections[0];
			if (!selection.isEmpty) {
				const pos = findOpeningCommentAfterPosition(selection.end);
				if (pos) {
					edit.insert(pos, replacementText);
				}
			}
		});		
	}
}

function findOpeningCommentAfterPosition(pos: vscode.Position): vscode.Position | undefined {
	const editor = vscode.window.activeTextEditor;
	if (editor) {
		const document = editor.document;
		const text = editor.document.getText(new vscode.Range(pos.line, pos.character, 
			document.lineCount - 1, document.lineAt(document.lineCount - 1).text.length));

		let offset = text.search(/(\s)/g);
		if (offset === -1) {
			return;
		}
		offset += document.offsetAt(pos);
		return document.positionAt(offset);
	}
	return undefined;
}

export async function openFileAtLineAndColumn(uri: vscode.Uri, line? : number, column? : vscode.ViewColumn) : Promise<void> {
	let editorForFile : vscode.TextEditor | undefined = await findOpenEditorForFileURI(uri);
	if (!editorForFile) {
		try {
			let actualColumn : vscode.ViewColumn = vscode.ViewColumn.Active;
			if (column) {
				actualColumn = (<any>vscode.ViewColumn)[column];
			}
			const openedDoc = await vscode.workspace.openTextDocument(uri);
			await vscode.window.showTextDocument(openedDoc, actualColumn);
			editorForFile = vscode.window.activeTextEditor;
		} catch (error) {
			await vscode.window.showWarningMessage(`Issues encountered opening ${uri.fsPath} at column ${column}. ${error}`);
			console.log(error);
			return;
		}
	}
	if (line && editorForFile) {
		// account for the fact that the line index is zero-based but the line numbers in the editor start at 1
		let trueLine = line-1;
		if (trueLine < 0) {
			trueLine = 0;
		}

		try {
			await vscode.commands.executeCommand('revealLine', { lineNumber: trueLine, at: 'top' });
		} catch (error) {
			await vscode.window.showWarningMessage(`Issues encountered opening ${uri.fsPath} at column ${column} and line ${line}. ${error}`);
			console.log(error);
		}
	}
}
