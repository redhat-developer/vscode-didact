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

export class DidactUriCompletionItemProviderMarkdown extends DidactUriCompletionItemProvider {

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

	public provideCompletionItemsOutsideDidactURI(lineToSearch: string) : vscode.CompletionItem[] {
		let completions: vscode.CompletionItem[] = [];

		if (lineToSearch.indexOf(didactProtocol) === -1) {
			this.insertValidateAllButtonCompletion("Insert Validate All Button", completions);
			this.insertNamedStatusLabelForRequirementCompletion("Insert Requirements Label", completions);
			this.insertInstallExtensionLinkCompletion("Insert link to install required VS Code extension", completions);
			this.insertAddWorkspaceFolderLinkCompletion("Insert link to create a temporary folder as WS root", completions);
			this.insertRedhatDidactLinkCompletion("Insert link to start Didact from File Elsewhere in Extension Folder", completions);
			this.insertDidactProtocolStarterCompletion("Start a new Didact link", completions);
		}

		return completions;
	}
}