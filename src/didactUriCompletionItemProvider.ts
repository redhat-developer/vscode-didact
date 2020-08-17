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

'use strict';

import * as vscode from 'vscode';
import * as extensionFunctions from './extensionFunctions';
import {DidactUri} from './didactUri';


export const didactProtocol = 'didact://?';

export class DidactUriCompletionItemProvider implements vscode.CompletionItemProvider {
	
	private extContext!: vscode.ExtensionContext;

	public constructor(ctxt: vscode.ExtensionContext) {
		this.extContext = ctxt;
	}

	provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
		let lineToSearch = document.lineAt(position).text;
		if (lineToSearch.indexOf(didactProtocol) > -1) {
			return this.provideCompletionItemsForDidactProtocol(lineToSearch);
		}
		return this.provideCompletionItemsOutsideDidactURI(lineToSearch);
	}

	protected provideCompletionItemsOutsideDidactURI(lineToSearch: string) : vscode.CompletionItem[] {
		let completions: vscode.CompletionItem[] = [];

		if (lineToSearch.indexOf(didactProtocol) === -1) {
			this.insertRedhatDidactLinkCompletion("Insert link to start Didact from File Elsewhere in Extension Folder", completions);
			this.insertDidactProtocolStarterCompletion("Start a new Didact link", completions);
		}

		return completions;
	}

	protected getCommandCompletionItems() : vscode.CompletionItem[] {
		let completions: vscode.CompletionItem[] = [];

		// Terminal commands
		this.startTerminalWithNameCompletion("Start Terminal with Name", completions);
		this.sendNamedTerminalAStringCompletion("Send Named Terminal Some Text", completions);
		this.sendTerminalCtrlCCompletion("Send Named Terminal a Ctrl+C", completions);
		this.closeTerminalCompletion("Close Terminal with Name", completions);

		// Non-didact command
		this.nonDidactCommandCompletion("Non-Didact Command", completions);

		// Requirements commands
		this.commandLineTextRequirementCompletion("Check CLI for Returned Text", completions);
		this.commandLineRequirementCompletion("Check CLI for Success (No Text)", completions);
		this.extensionRequirementCompletion("Check for Required Extension", completions);
		this.workspaceFolderRequirementCompletion("Check for Root Folder in the WS", completions);

		// Project Scaffolding commands
		this.projectScaffoldingCompletion("Scaffold Project", completions);

		// Starting other didact files
		this.startDidactCompletion("Start Didact from Currently Selected File", completions);

		return completions;
	}

	// public for testing purposes
	public provideCompletionItemsForDidactProtocol(text: string): vscode.CompletionItem[] {
		let completions: vscode.CompletionItem[] = [];
		let didactUri = this.getDidactUriFromLine(text);
		if (didactUri && !didactUri.getCommandId()) {
			completions = this.getCommandCompletionItems();
		}
		return completions;
	}

	protected startTerminalWithNameCompletion(labelText: string, completions : vscode.CompletionItem[]) {
		// example: didact://?commandId=vscode.didact.startTerminalWithName&text=NamedTerminal
		const snippetCompletion = new vscode.CompletionItem(labelText);
		const parms = ['TerminalNameIsOptional'];
		const snippetString = this.createCommandParmSnippetString({ commandId: extensionFunctions.START_TERMINAL_COMMAND, parms });
		snippetCompletion.insertText = new vscode.SnippetString(snippetString);
		snippetCompletion.documentation = new vscode.MarkdownString("Inserts a snippet that enables you to set the Terminal Name for the new Terminal.");
		completions.push(snippetCompletion);
	}

	protected sendNamedTerminalAStringCompletion(labelText: string, completions : vscode.CompletionItem[]) {
		// example: didact://?commandId=vscode.didact.sendNamedTerminalAString&text=NamedTerminal$$ping%20localhost
		const snippetCompletion = new vscode.CompletionItem(labelText);
		const parms = ['TerminalName', 'URLEncodedTextToSendTerminal'];
		const snippetString = this.createCommandParmSnippetString({ commandId: extensionFunctions.SEND_TERMINAL_SOME_TEXT_COMMAND, parms });
		snippetCompletion.insertText = new vscode.SnippetString(snippetString);
		snippetCompletion.documentation = new vscode.MarkdownString("Inserts a snippet that enables you to set the Terminal Name and Text to send the Terminal.");
		completions.push(snippetCompletion);
	}

	protected sendTerminalCtrlCCompletion(labelText: string, completions : vscode.CompletionItem[]) {
		// example: didact://?commandId=vscode.didact.sendNamedTerminalCtrlC&text=SecondTerminal
		const snippetCompletion = new vscode.CompletionItem(labelText);
		const parms = ['TerminalName'];
		const snippetString = this.createCommandParmSnippetString({ commandId: extensionFunctions.SEND_TERMINAL_KEY_SEQUENCE, parms });
		snippetCompletion.insertText = new vscode.SnippetString(snippetString);
		snippetCompletion.documentation = new vscode.MarkdownString("Inserts a snippet to send a Ctrl+C to a named Terminal to stop a long-running process.");
		completions.push(snippetCompletion);
	}

	protected closeTerminalCompletion(labelText: string, completions : vscode.CompletionItem[]) {
		// example: didact://?commandId=vscode.didact.closeNamedTerminal&text=NamedTerminal
		const snippetCompletion = new vscode.CompletionItem(labelText);
		const parms = ['TerminalName'];
		const snippetString = this.createCommandParmSnippetString({ commandId: extensionFunctions.CLOSE_TERMINAL, parms });
		snippetCompletion.insertText = new vscode.SnippetString(snippetString);
		snippetCompletion.documentation = new vscode.MarkdownString("Inserts a snippet to close/kill a named Terminal.");
		completions.push(snippetCompletion);
	}

	protected insertValidateAllButtonCompletion(labelText: string, completions : vscode.CompletionItem[]) {
		// example: <a href='didact://?commandId=vscode.didact.validateAllRequirements' 
		//           title='Validate all requirements!'><button>Validate all Requirements at Once!</button></a>
		const snippetString = 
			"<a href='didact://?commandId=vscode.didact.validateAllRequirements' title='${1:Validate all requirements!}'>" +
			"<button>${2:Validate all Requirements at Once!}</button></a>";
		const docs = "Inserts a snippet for a Validate All Requirements button.";
		this.processSimplerLink(labelText, snippetString, docs, completions);
	}

	protected insertNamedStatusLabelForRequirementCompletion(labelText: string, completions : vscode.CompletionItem[]) {
		// example: *Status: unknown*{#minikube-requirements-status}
		const snippetString = "*Status: unknown*{#${1:requirement-name}}";
		const docs = "Inserts a snippet for a requirement validation label.";
		this.processSimplerLink(labelText, snippetString, docs, completions);
	}

	protected insertInstallExtensionLinkCompletion(labelText: string, completions : vscode.CompletionItem[]) {
		// example: [Click here to install the Extension Pack.](vscode:extension/redhat.apache-camel-extension-pack)		
		const snippetString = "[Click here to install the ${1:ExtensionPackName}.](vscode:extension/${2:ExtensionPackID})";
		const docs = "Inserts a snippet for a link to install a particular required VS Code extension.";
		this.processSimplerLink(labelText, snippetString, docs, completions);
	}

	protected insertAddWorkspaceFolderLinkCompletion(labelText: string, completions : vscode.CompletionItem[]) {
		// example: [click here to create a temporary folder](didact://?commandId=vscode.didact.createWorkspaceFolder)		
		const snippetString = "[Click here to create a temporary folder as the workspace root.](didact://?commandId=vscode.didact.createWorkspaceFolder)";
		const docs = "Inserts a snippet for a link to create a temporary folder and set it as the workspace root.";
		this.processSimplerLink(labelText, snippetString, docs, completions);
	}

	protected commandLineTextRequirementCompletion(labelText: string, completions : vscode.CompletionItem[]) {
		// example: didact://?commandId=vscode.didact.requirementCheck&text=minikube-requirements-status$$minikube%20status$$host:%20Running
		const snippetCompletion = new vscode.CompletionItem(labelText);
		const parms = ['Requirement-Label', 'URLEncodedCLIToExecute', 'URLEncodedTextToCheckInReturn'];
		const snippetString = this.createCommandParmSnippetString({ commandId: extensionFunctions.REQUIREMENT_CHECK_COMMAND, parms });
		snippetCompletion.insertText = new vscode.SnippetString(snippetString);
		snippetCompletion.documentation = new vscode.MarkdownString("Inserts a snippet to validate if a CLI command, when executed, returns a string in the text that comes back.");
		completions.push(snippetCompletion);
	}

	protected commandLineRequirementCompletion(labelText: string, completions : vscode.CompletionItem[]) {
		// example: didact://?commandId=vscode.didact.cliCommandSuccessful&text=oc-install-status$$oc%20version
		const snippetCompletion = new vscode.CompletionItem(labelText);
		const parms = ['Requirement-Label', 'URLEncodedCLIToExecute'];
		const snippetString = this.createCommandParmSnippetString({ commandId: extensionFunctions.CLI_SUCCESS_COMMAND, parms });
		snippetCompletion.insertText = new vscode.SnippetString(snippetString);
		snippetCompletion.documentation = new vscode.MarkdownString("Inserts a snippet to validate if a CLI command, when executed, runs successfully (returns a 0 return code).");
		completions.push(snippetCompletion);
	}

	protected extensionRequirementCompletion(labelText: string, completions : vscode.CompletionItem[]) {
		// example: didact://?commandId=vscode.didact.extensionRequirementCheck&text=extension-requirement-status$$redhat.apache-camel-extension-pack
		const snippetCompletion = new vscode.CompletionItem(labelText);
		const parms = ['Requirement-Label', 'ExtensionIDToCheck'];
		const snippetString = this.createCommandParmSnippetString({ commandId: extensionFunctions.EXTENSION_REQUIREMENT_CHECK_COMMAND, parms });
		snippetCompletion.insertText = new vscode.SnippetString(snippetString);
		snippetCompletion.documentation = new vscode.MarkdownString("Inserts a snippet to validate if a particular VS Code Extension is installed.");
		completions.push(snippetCompletion);
	}

	protected workspaceFolderRequirementCompletion(labelText: string, completions : vscode.CompletionItem[]) {
		// example: didact://?commandId=vscode.didact.workspaceFolderExistsCheck&text=workspace-folder-status
		const snippetCompletion = new vscode.CompletionItem(labelText);
		const parms = ['Requirement-Label'];
		const snippetString = this.createCommandParmSnippetString({ commandId: extensionFunctions.WORKSPACE_FOLDER_EXISTS_CHECK_COMMAND, parms });
		snippetCompletion.insertText = new vscode.SnippetString(snippetString);
		snippetCompletion.documentation = new vscode.MarkdownString("Inserts a snippet to validate if the user workspace has at least one root folder.");
		completions.push(snippetCompletion);
	}

	protected projectScaffoldingCompletion(labelText: string, completions : vscode.CompletionItem[]) {
		// example: didact://?commandId=vscode.didact.scaffoldProject&extFilePath=redhat.vscode-didact/create_extension/md-tutorial.project.didact.json
		const snippetCompletion = new vscode.CompletionItem(labelText);
		const pathStr = 'projectFilePath=${1:pathToProjectJSONInWorkspace}';
		const snippetString = this.createCommandPathSnippetString(extensionFunctions.SCAFFOLD_PROJECT_COMMAND, pathStr);
		snippetCompletion.insertText = new vscode.SnippetString(snippetString);
		snippetCompletion.documentation = new vscode.MarkdownString("Inserts a snippet to scaffold a project from a project.json file located in a folder in the extension.");
		completions.push(snippetCompletion);
	}

	protected startDidactCompletion(labelText: string, completions : vscode.CompletionItem[]) {
		// example: didact://?commandId=vscode.didact.startDidact
		const snippetCompletion = new vscode.CompletionItem(labelText);
		const snippetString = this.createCommandParmSnippetString({ commandId: extensionFunctions.START_DIDACT_COMMAND });
		snippetCompletion.insertText = new vscode.SnippetString(snippetString);
		snippetCompletion.documentation = new vscode.MarkdownString("Inserts a snippet to open the Didact window with the currently selected file.");
		completions.push(snippetCompletion);
	}

	protected insertRedhatDidactLinkCompletion(labelText: string, completions : vscode.CompletionItem[]) {
		// example: vscode://redhat.vscode-didact?extension=example/tutorial.didact.md
		const snippetString = "vscode://redhat.vscode-didact?extension=${1:PathToFileInExtensionFolder}";
		const docs = "Inserts a snippet to open the Didact window with a file elsewhere in the extension folder structure.";
		this.processSimplerLink(labelText, snippetString, docs, completions);
	}

	protected nonDidactCommandCompletion(labelText: string, completions : vscode.CompletionItem[]) {
		// example: didact://?commandId=vscode.open&projectFilePath=anotherProject/src/simple.groovy	
		const snippetString = "commandId=${1:CommandId}";
		const docs = "Inserts a snippet for Didact to call another kind of command. May require additional configuration based on parameters required.";
		this.processSimplerLink(labelText, snippetString, docs, completions);
	}

	protected insertDidactProtocolStarterCompletion(labelText: string, completions : vscode.CompletionItem[]) {
		// example: didact://?
		const snippetString = didactProtocol;
		const docs = "Inserts the `didact://?` start to a link";
		const item = this.processSimplerLink(labelText, snippetString, docs);
		item.command = { command: 'editor.action.triggerSuggest', title: 'Re-trigger completions...' };
		completions.push(item);
	}

	// utility functions

	protected processSimplerLink(labelText: string, snippetString : string, docs : string, completions? : vscode.CompletionItem[]) : vscode.CompletionItem {
		const snippetCompletion = new vscode.CompletionItem(labelText);
		snippetCompletion.insertText = new vscode.SnippetString(snippetString);
		snippetCompletion.documentation = new vscode.MarkdownString(docs);
		completions?.push(snippetCompletion);
		return snippetCompletion;
	}

	protected createCommandParmSnippetString({ commandId, parms }: { commandId: string; parms?: string[]; }) : string {
		if (parms) {
			return this.createCommandString(commandId) + this.createTextParameterSnippetStringFromArray(parms);
		}
		return this.createCommandString(commandId);
	}

	protected getDidactUriFromLine(text: string) : DidactUri | undefined {
		let returnedObject;
		const start = text.indexOf(didactProtocol);
		if (start > -1) {
			const linkRegex = /\w+:(\/?\/?)[^\s]+/;
			const matches = text.match(linkRegex);
			if (matches && matches.length > 0) {
				const parsethis = matches[0];
				const didactUri = new DidactUri(parsethis, this.extContext);
				if (didactUri) {
					returnedObject = didactUri;
				}
			}
		}
		return returnedObject;
	}

	private createCommandPathSnippetString(commandId: string, path: string ) : string {
		return this.createCommandString(commandId) + this.createPathSnippetString(path);
	}

	private createCommandString(command: string) : string {
		return `commandId=${command}`;
	}

	private createTextParameterSnippetStringFromArray(parms : string[]): string {
		let output = '';
		for (let index = 0; index < parms.length; index++) {
			const parm = parms[index];
			if (index === 0) {
				output += this.createTextParameterSnippetString(index + 1, parm, true);
			} else {
				output += this.createTextParameterSnippetString(index + 1, parm);
			}
		}
		return output;
	}

	private createPathSnippetString(pathSnippet : string) : string {
		//&projectPath=${1:pathtofile}
		return `&${pathSnippet}`;
	}

	private createTextParameterSnippetString(num: number, param : string, isFirst? : boolean) : string {
		//&text=${1:Parm1}$$${2:Parm2}$$${3:Parm3}
		let returnString;
		if (isFirst) {
			returnString = `&text=`;
		} else {
			returnString = '$$';
		}
		returnString += '${' + `${num}:${param}` + '}';
		return returnString;
	}
}
