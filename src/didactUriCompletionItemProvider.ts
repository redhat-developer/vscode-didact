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

let extContext: vscode.ExtensionContext;

export function setContext(ctxt: vscode.ExtensionContext) {
	extContext = ctxt;
}

export class DidactUriCompletionItemProvider implements vscode.CompletionItemProvider {
	
	provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
		let lineToSearch = document.lineAt(position).text;
		if (lineToSearch.indexOf('didact://?') > -1) {
			return this.provideCompletionItemsForText(lineToSearch, document.offsetAt(position));
		}
		return undefined;
	}

	public provideCompletionItemsForText(text: string, offset: number): vscode.CompletionItem[] {
		let completions: vscode.CompletionItem[] = [];
		if (text.indexOf('didact://?') > -1) {
			const start = text.indexOf('didact://?');
			const end = text.indexOf(' ', start);
			const parsethis = text.substring(start, end);
			const didactUri = new DidactUri(parsethis, extContext);
			if (didactUri) {
				if (!didactUri.getCommandId()) {
					completions = this.getCommandCompletionItems();
				} else {
					completions = this.processCommandCompletions(didactUri);
				}
			}
		}
		return completions;
	}

	private processCommandCompletions(didactUri : DidactUri) : vscode.CompletionItem[] {
		let completions: vscode.CompletionItem[] = [];
		if (didactUri && didactUri.getCommandId() === extensionFunctions.START_TERMINAL_COMMAND) {
			this.processStartTerminalWithNameCompletions(didactUri, completions);
		} else if (didactUri && didactUri.getCommandId() === extensionFunctions.SEND_TERMINAL_SOME_TEXT_COMMAND) {
			this.processSendNamedTerminalAStringCompletions(didactUri, completions);
		}
		return completions;
	}

	private processStartTerminalWithNameCompletions(didactUri : DidactUri, completions? : vscode.CompletionItem[]) {
		// example: didact://?commandId=vscode.didact.startTerminalWithName&text=NamedTerminal
		const snippetCompletion = new vscode.CompletionItem('startTerminalWithName completion');
		snippetCompletion.insertText = new vscode.SnippetString('text=${1:TerminalNameIsOptional}');
		snippetCompletion.documentation = new vscode.MarkdownString("Inserts a snippet that enables you to set the Terminal Name for the new Terminal.");
		completions?.push(snippetCompletion);
	}

	private processSendNamedTerminalAStringCompletions(didactUri : DidactUri, completions? : vscode.CompletionItem[]) {
		// example: didact://?commandId=vscode.didact.sendNamedTerminalAString&text=NamedTerminal$$ping%20localhost
		let text = didactUri.getText();
		if (!text || (text && text.length === 0)) {
			const snippetCompletion = new vscode.CompletionItem('sendNamedTerminalAString completion');
			snippetCompletion.insertText = new vscode.SnippetString('text=${1:TerminalName}$$${2:URLEncodedTextToSendTerminal}');
			snippetCompletion.documentation = new vscode.MarkdownString("Inserts a snippet that enables you to set the Terminal Name and Text to send the Terminal.");
			completions?.push(snippetCompletion);
		}
	}

	private getCommandCompletionItems() : vscode.CompletionItem[] {
		let completions: vscode.CompletionItem[] = [];
		this.createCommandCompletionItem("Scaffold Project Command", extensionFunctions.SCAFFOLD_PROJECT_COMMAND, completions);
		this.createCommandCompletionItem("Start Terminal with Name", extensionFunctions.START_TERMINAL_COMMAND, completions);
		this.createCommandCompletionItem("Send Named Terminal Some Text", extensionFunctions.SEND_TERMINAL_SOME_TEXT_COMMAND, completions);
		this.createCommandCompletionItem("Send Named Terminal a Ctrl+C", extensionFunctions.SEND_TERMINAL_KEY_SEQUENCE, completions);
		this.createCommandCompletionItem("Close Terminal with Name", extensionFunctions.CLOSE_TERMINAL, completions);
		this.createCommandCompletionItem("Check CLI for some returned text", extensionFunctions.REQUIREMENT_CHECK_COMMAND, completions);
		this.createCommandCompletionItem("Check CLI for success (no text)", extensionFunctions.CLI_SUCCESS_COMMAND, completions);
		this.createCommandCompletionItem("Check for required extension", extensionFunctions.EXTENSION_REQUIREMENT_CHECK_COMMAND, completions);
		this.createCommandCompletionItem("Check for root folder in the WS", extensionFunctions.WORKSPACE_FOLDER_EXISTS_CHECK_COMMAND, completions);
		this.createCommandCompletionItem("Create a temporary root folder for the WS", extensionFunctions.CREATE_WORKSPACE_FOLDER_COMMAND, completions);
		this.createCommandCompletionItem("Create a temporary root folder for the WS", extensionFunctions.CREATE_WORKSPACE_FOLDER_COMMAND, completions);
		this.createCommandCompletionItem("Non-Didact Command", "some.other.command", completions);
		return completions;
	}

	private createCompletionItem(labelText: string, codetext: string, completions? : vscode.CompletionItem[]) : vscode.CompletionItem {
		let item: vscode.CompletionItem = {
			label: labelText,
			insertText : codetext
		};
		if (completions) {
			completions.push(item);
		}
		return item;
	}

	private createCommandCompletionItem(labelText: string, codetext: string, completions? : vscode.CompletionItem[]) : vscode.CompletionItem {
		let modCodeText = `commandId=${codetext}& `;
		return this.createCompletionItem(labelText, modCodeText, completions);
	}


}