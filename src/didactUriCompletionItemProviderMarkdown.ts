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
		let completions = super.getCommandCompletionItems();
		return completions;
	}

	public provideCompletionItemsOutsideDidactURI(lineToSearch: string) : vscode.CompletionItem[] {
		let completions: vscode.CompletionItem[] = super.provideCompletionItemsOutsideDidactURI(lineToSearch);

		if (lineToSearch.indexOf(didactProtocol) === -1) {
			// add these for markdown
			super.insertValidateAllButtonCompletion("Insert Validate All Button", completions);
			super.insertNamedStatusLabelForRequirementCompletion("Insert Requirements Label", completions);
			super.insertInstallExtensionLinkCompletion("Insert link to install required VS Code extension", completions);
			super.insertAddWorkspaceFolderLinkCompletion("Insert link to create a temporary folder as WS root", completions);
		}

		return completions;
	}
}