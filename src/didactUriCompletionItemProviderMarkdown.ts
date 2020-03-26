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
		super.startTerminalWithNameCompletion("Start Terminal with Name", completions);
		super.sendNamedTerminalAStringCompletion("Send Named Terminal Some Text", completions);
		super.sendTerminalCtrlCCompletion("Send Named Terminal a Ctrl+C", completions);
		super.closeTerminalCompletion("Close Terminal with Name", completions);

		// Non-didact command
		super.nonDidactCommandCompletion("Non-Didact Command", completions);

		// Requirements commands
		super.commandLineTextRequirementCompletion("Check CLI for Returned Text", completions);
		super.commandLineRequirementCompletion("Check CLI for Success (No Text)", completions);
		super.extensionRequirementCompletion("Check for Required Extension", completions);
		super.workspaceFolderRequirementCompletion("Check for Root Folder in the WS", completions);

		// Project Scaffolding commands
		super.projectScaffoldingCompletion("Scaffold Project", completions);

		// Starting other didact files
		super.startDidactCompletion("Start Didact from Currently Selected File", completions);

		return completions;
	}

	public provideCompletionItemsOutsideDidactURI(lineToSearch: string) : vscode.CompletionItem[] {
		let completions: vscode.CompletionItem[] = [];

		if (lineToSearch.indexOf(didactProtocol) === -1) {
			super.insertValidateAllButtonCompletion("Insert Validate All Button", completions);
			super.insertNamedStatusLabelForRequirementCompletion("Insert Requirements Label", completions);
			super.insertInstallExtensionLinkCompletion("Insert link to install required VS Code extension", completions);
			super.insertAddWorkspaceFolderLinkCompletion("Insert link to create a temporary folder as WS root", completions);
			super.insertRedhatDidactLinkCompletion("Insert link to start Didact from File Elsewhere in Extension Folder", completions);
			super.insertDidactProtocolStarterCompletion("Start a new Didact link", completions);
		}

		return completions;
	}
}