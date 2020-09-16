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
import {didactProtocol, DidactUriCompletionItemProvider} from './didactUriCompletionItemProvider';
import * as extensionFunctions from './extensionFunctions';

export class DidactUriCompletionItemProviderAsciiDoc extends DidactUriCompletionItemProvider {

	protected getCommandCompletionItems() : vscode.CompletionItem[] {
		const completions : vscode.CompletionItem[] = super.getCommandCompletionItems();
		
		// add some additional didact types here because we can't do HTML kinds of things in AsciiDoc
		this.validateAllRequirementsCompletion("Validate All Didact Requirements", completions);
		this.addWorkspaceFolderCompletion("Add Temporary Folder as WS Root", completions);

		return completions;
	}

	public provideCompletionItemsOutsideDidactURI(lineToSearch: string) : vscode.CompletionItem[] {
		const completions: vscode.CompletionItem[] = super.provideCompletionItemsOutsideDidactURI(lineToSearch);

		if (lineToSearch.indexOf(didactProtocol) === -1) {
			// add one for asciidoc 
			this.insertInstallExtensionLinkAsciiDocCompletion("Insert Link to Install Required VS Code extension", completions);
		}

		return completions;
	}

	private insertInstallExtensionLinkAsciiDocCompletion(labelText: string, completions : vscode.CompletionItem[]) {
		// example: vscode:extension/redhat.apache-camel-extension-pack
		const snippetString = "vscode:extension/${1:ExtensionPackID}";
		const docs = "Inserts a snippet for a link to install a particular required VS Code extension.";
		super.processSimplerLink(labelText, snippetString, docs, completions);
	}

	private validateAllRequirementsCompletion(labelText: string, completions : vscode.CompletionItem[]) {
		// example: didact://?commandId=vscode.didact.validateAllRequirements
		const snippetCompletion = new vscode.CompletionItem(labelText);
		const snippetString = super.createCommandParmSnippetString({ commandId: extensionFunctions.VALIDATE_ALL_REQS_COMMAND });
		snippetCompletion.insertText = new vscode.SnippetString(snippetString);
		snippetCompletion.documentation = new vscode.MarkdownString("Inserts a snippet for a link that validates all Didact requirements checks.");
		completions.push(snippetCompletion);
	}

	private addWorkspaceFolderCompletion(labelText: string, completions : vscode.CompletionItem[]) {
		// example: didact://?commandId=vscode.didact.createWorkspaceFolder
		const snippetCompletion = new vscode.CompletionItem(labelText);
		const snippetString = super.createCommandParmSnippetString({ commandId: extensionFunctions.CREATE_WORKSPACE_FOLDER_COMMAND });
		snippetCompletion.insertText = new vscode.SnippetString(snippetString);
		snippetCompletion.documentation = new vscode.MarkdownString("Inserts a snippet for a link that creates a temporary folder and sets it as the workspace root.");
		completions.push(snippetCompletion);
	}	

}