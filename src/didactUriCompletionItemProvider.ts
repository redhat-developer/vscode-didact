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
		this.completionCatalog = this.getCompletionCatalog(this.extContext);
	}

	// public for testing
	public getCompletionCatalog(context: vscode.ExtensionContext) : JSON {
		const uri : vscode.Uri = vscode.Uri.file(
			path.join(context.extensionPath, 'resources/didactCompletionCatalog.json')
		);
		const jsoncontent = fs.readFileSync(uri.fsPath, 'utf8');
		return JSON.parse(jsoncontent).completions;
	}

	async provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, 
		token: vscode.CancellationToken, context: vscode.CompletionContext) : Promise<vscode.CompletionItem[]> {

		let completions: vscode.CompletionItem[] = [];
		
		const searchInput: string = document.lineAt(position).text;
		const linkMatch = this.findMatchForLinkPrefix(searchInput);
		const prefixMatch = this.findMatchForDidactPrefix(searchInput);
		const commandMatch = this.findMatchForCommandVariable(searchInput);

		if (((prefixMatch && prefixMatch[0]) || linkMatch) && !commandMatch) {
			completions.push(this.didactProtocolCompletion(document, position));
		}

		if (commandMatch) {
			const commandCompletions = await this.didactCommandCompletion(document, position);
			completions = completions.concat(commandCompletions.items);
		} else if (!(prefixMatch && prefixMatch[0]) && !linkMatch) {
			if (this.isDidactAsciiDocFile(document.fileName)) {
				completions.push(this.insertNamedStatusLabelAdoc());
				completions.push(this.insertInstallExtensionLinkAsciiDoc());
			} else if (this.isDidactMarkdownFile(document.fileName)) {
				completions.push(this.insertNamedStatusLabelMarkdown());
				completions.push(this.insertValidateAllButtonMarkdown());
				completions.push(this.insertInstallExtensionLinkMarkdown());
			}
		}

		return completions;
	}

	private getWholeDidactString(document: vscode.TextDocument, position: vscode.Position) : vscode.Range | undefined {
		const line = position.line;
		const rangeAtLine : vscode.Range = document.lineAt(line).range;
		const textForRange : string = document.getText(rangeAtLine);

		const match = this.findMatchForWholeDidactLink(textForRange);
		let start = rangeAtLine.start;
		let end = rangeAtLine.end;
		if (match && match[0]) {
			const indexOfStringToFind = textForRange.indexOf(match[0]);
			start = new vscode.Position(line, indexOfStringToFind);

			let lengthOfString = match[0].length;
			if (match[0].endsWith(')')) {
				lengthOfString -= 1;
			}
			end = new vscode.Position(line, start.character + lengthOfString);
		}
		console.log(`Start = ${start.character}`);
		console.log(`End = ${end.character}`);

		const rangeToReturn = new vscode.Range(start, end);
		const testForRange : string = document.getText(rangeToReturn);
		const matchFinal = this.findMatchForDidactPrefix(textForRange);
		if (!matchFinal) {
			return undefined;
		}
		console.log(testForRange);

		return rangeToReturn;
	}

	didactProtocolCompletion(document: vscode.TextDocument, position: vscode.Position) : vscode.CompletionItem {
		const labelText = "Start new Didact command link";
		const docs = "Completes the didact link start to insert a command id";
		const command = { command: 'editor.action.triggerSuggest', title: 'Autocomplete' };

		const completionItem = new vscode.CompletionItem(labelText, vscode.CompletionItemKind.Value);
		completionItem.detail = labelText;
		completionItem.insertText = DIDACT_COMMAND_PREFIX;
		completionItem.documentation = new vscode.MarkdownString(docs);
		completionItem.command = command;
		completionItem.filterText
		
		const range = this.getWholeDidactString(document, position);
		if (range) {
			completionItem.additionalTextEdits = [
				vscode.TextEdit.delete(range)
			];
		}
		return completionItem;
	}

	insertNamedStatusLabelAdoc() : vscode.CompletionItem {
		const labelText = "Insert Didact Requirements Label";
		const snippetText = "[[${1:requirement-name}]]\n_Status: unknown_";
		const snippetString = new vscode.SnippetString(snippetText);
		const docs = "Inserts a snippet for a Didact requirement validation label";
		return this.processSimplerLink(labelText, snippetString, docs);
	}

	insertNamedStatusLabelMarkdown() : vscode.CompletionItem {
		const labelText = "Insert Didact Requirements Label";
		const snippetText = "*Status: unknown*{#${1:requirement-name}}";
		const snippetString = new vscode.SnippetString(snippetText);
		const docs = "Inserts a snippet for a Didact requirement validation label";
		return this.processSimplerLink(labelText, snippetString, docs);
	}

	insertValidateAllButtonMarkdown() : vscode.CompletionItem {
		const labelText = "Insert Validate All Button";
		const snippetText = 
		"<a href='didact://?commandId=vscode.didact.validateAllRequirements' title='${1:Validate all requirements!}'>" +
		"<button>${2:Validate all Requirements at Once!}</button></a>";
		const snippetString = new vscode.SnippetString(snippetText);
		const docs = "Inserts a snippet for a Validate All Requirements button";
		return this.processSimplerLink(labelText, snippetString, docs);
	}

	insertInstallExtensionLinkMarkdown() : vscode.CompletionItem {
		const labelText = "Insert link to install required VS Code extension";
		const snippetText = "[Click here to install the ${1:ExtensionPackName}.](vscode:extension/${2:ExtensionPackID})";
		const snippetString = new vscode.SnippetString(snippetText);
		const docs = "Inserts a snippet for a link to install a particular required VS Code extension";
		return this.processSimplerLink(labelText, snippetString, docs);
	}

	insertInstallExtensionLinkAsciiDoc() : vscode.CompletionItem {
		const labelText = "Insert link to install required VS Code extension";
		const snippetText = "link:vscode:extension/${2:ExtensionPackID}[Click here to install the ${1:ExtensionPackName}.]";
		const snippetString = new vscode.SnippetString(snippetText);
		const docs = "Inserts a snippet for a link to install a particular required VS Code extension";
		return this.processSimplerLink(labelText, snippetString, docs);
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
		if (match && match[1]) {
			const stringToFind = `=${match[1]}`;
			// find the string, then add one to account for the equals sign
			const indexOfStringToFind = textForRange.indexOf(stringToFind) + 1; 
			const startPosToReplace : number = rangeAtLine.start.character + indexOfStringToFind;
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

	// public for testing
	public findMatchForCommandVariable(input: string): RegExpMatchArray | null {
		if (input) {
			const regex = /(?:\?commandId=*)([^&[)]*)/g;
			return regex.exec(input);
		}
		return null;
	}

	public findMatchForDidactPrefix(input: string): RegExpMatchArray | null {
		if (input) {
			const regex = /(?:link:|\()(didact(:?)(\/?)(\/?)(\?)?)/g
			//const regex = /(didact[?:\\/\\?]*)([^/)]*)/g;
			//const regex = /(didact)+(:)?(\/)*(\\?)?([^)])/gm;
			try {
				return input.match(regex);
			} catch (error) {
				console.log('regex err: ' + error);
			}
		}
		return null;
	}

	public findMatchForWholeDidactLink(input: string): RegExpMatchArray | null {
		if (input) {
			const regex = /didact(:?)(\/)*(\\?)(.*)/g;
			try {
				return input.match(regex);
			} catch (error) {
				console.log('regex err: ' + error);
			}
		}
		return null;
	}

	public findMatchForLinkPrefix(input: string): RegExpMatchArray | null {
		if (input) {
			const regex = /(?:link:|\()(\[)?/g;
			try {
				return input.match(regex);
			} catch (error) {
				console.log('regex err: ' + error);
			}
		}
		return null;
	}

	private processSimplerLink(labelText: string, snippetString : string | vscode.SnippetString, docs : string, command? : vscode.Command) : vscode.CompletionItem {
		const snippetCompletion = new vscode.CompletionItem(labelText);
		snippetCompletion.insertText = snippetString;
		snippetCompletion.documentation = new vscode.MarkdownString(docs);
		if (command) {
			snippetCompletion.command = command;
		}
		return snippetCompletion;
	}

	private checkFileExtension(fspath : string, extension : string) : boolean {
		const ext = path.extname(fspath);
		if (ext) {
			return (ext === extension);
		}
		return false;
	}

	private isDidactMarkdownFile(fspath : string) : boolean {
		return this.checkFileExtension(fspath, '.md');
	}

	private isDidactAsciiDocFile(fspath : string) : boolean {
		return this.checkFileExtension(fspath, '.adoc');
	}
}
