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
import * as path from 'path';
import * as fs from 'fs';

const DIDACT = 'didact';
const COMMAND_ID = 'commandId';

export const didactProtocol = `${DIDACT}://?`;
export const DIDACT_COMMAND_PREFIX = `${didactProtocol}${COMMAND_ID}=`;

export class DidactUriCompletionItemProvider implements vscode.CompletionItemProvider {
	
	private extContext!: vscode.ExtensionContext;
	private completionCatalog: any;

	public constructor(ctxt: vscode.ExtensionContext) {
		this.extContext = ctxt;
		this.completionCatalog = this.getCompletionCatalog();
	}

	private getCompletionCatalog() : JSON {
		const uri : vscode.Uri = vscode.Uri.file(
			path.join(this.extContext.extensionPath, 'src/didactCompletionCatalog.json')
		);
		const jsoncontent = fs.readFileSync(uri.fsPath, 'utf8');
		return JSON.parse(jsoncontent).completions;
	}

	async provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, 
		token: vscode.CancellationToken, context: vscode.CompletionContext) : Promise<vscode.CompletionItem[]> {
		let completions: vscode.CompletionItem[] = [];
		const PAREN_REGEX = /(?<=\()[^)]+/g;
		const searchInput: string = document.getText(document.getWordRangeAtPosition(position, PAREN_REGEX));
		console.log(searchInput);
		if (searchInput === DIDACT) {
			completions.push(this.didactProtocolCompletion());
		}
		if (completions.length === 0 && searchInput.startsWith(DIDACT_COMMAND_PREFIX)) {
			const commandCompletions = await this.didactCommandCompletion(document, position);
			completions = completions.concat(commandCompletions.items);
		}
		return completions;
	}

	didactProtocolCompletion() : vscode.CompletionItem {
		const completionItem:vscode.CompletionItem = new vscode.CompletionItem("Start new Didact command link");
		completionItem.documentation = "Completes the didact link start to insert a command id";
		completionItem.filterText = DIDACT;
		completionItem.insertText = DIDACT_COMMAND_PREFIX;
		completionItem.kind = vscode.CompletionItemKind.Snippet;
		completionItem.command = { command: 'editor.action.triggerSuggest', title: 'Autocomplete' };
		return completionItem;
	}

	// public for testing
	public findMatchForCommandVariable(input: string): RegExpMatchArray | null {
		if (input) {
			// TODO: Find a way to make this a compiled regex, but nothing so far has worked for me
			const regex = '[?]' + COMMAND_ID + '=([^&)]+)';
			return input.match(regex);
		}
		return null;
	}

	// public for testing
	public async processCommands(match? : RegExpMatchArray | null, rangeToReplace? : vscode.Range, completionList? : vscode.CompletionList ) : Promise<vscode.CompletionList> {
		if (!completionList) {
			completionList = new vscode.CompletionList();
		}
		const vsCommands : string[] = await vscode.commands.getCommands(true);
		vsCommands.forEach(cmd => {
			if (match && match[1]) {
				if(cmd.indexOf(match[1]) === -1) return;
			}
			const snip = new vscode.CompletionItem(cmd);
			snip.kind = vscode.CompletionItemKind.Snippet;

			if (rangeToReplace) {
				snip.range = rangeToReplace;
			}
			this.completionCatalog.forEach((completion:any) => {
				const fullCommandId = completion.fullCommandId;
				if (cmd === fullCommandId) {
					snip.documentation = completion.documentation;
					const parms = completion.parms;
					if (parms) {
						cmd += `${this.createTextParameterSnippetStringFromArray(parms)}`;
					}
				}
			});
			snip.insertText = new vscode.SnippetString(`${cmd}`);
			if (completionList) {
				completionList.items.push(snip);
			}
		});
		return completionList;
	}

	async didactCommandCompletion(document: vscode.TextDocument, position: vscode.Position) : Promise<vscode.CompletionList> {
		const completionList = new vscode.CompletionList();

		const line = position.line;
		const rangeAtLine : vscode.Range = document.lineAt(line).range;
		const textForRange : string = document.getText(rangeAtLine);

		const match = this.findMatchForCommandVariable(textForRange);
		let rangeToReplace : vscode.Range | undefined = undefined;
		if (match && match[0]) {
			const startPosToReplace : number = rangeAtLine.start.character + textForRange.indexOf(match[1]);
			rangeToReplace = new vscode.Range(new vscode.Position(line, startPosToReplace), 
				new vscode.Position(line, startPosToReplace + match[1].length));
		}

		await this.processCommands(match, rangeToReplace, completionList);	
		return completionList;
	}

	// utility functions
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
