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

import {getValue} from './utils';
import * as vscode from 'vscode';
const url = require('url-parse');

export class DidactUri {
	private commandId: string | undefined;
	private completionMessage : string | undefined;
	private errorMessage : string | undefined;
	private projectFilePath : string | undefined;
	private srcFilePath : string | undefined;
	private extFilePath : string | undefined;
	private text : string | undefined;
	private user : string | undefined;
	private number : string | undefined;

	private context: vscode.ExtensionContext;

	public constructor(incomingUrl: string, ctx : vscode.ExtensionContext ) {
		this.context = ctx;
		this.parseDidactUrl(incomingUrl);
	}

	public getCommandId(): string | undefined {
		return this.commandId;
	}

	public getCompletionMessage() : string | undefined {
		return this.completionMessage;
	}

	public getErrorMessage() : string | undefined {
		return this.errorMessage;
	}

	public getProjectFilePath() : string | undefined {
		return this.projectFilePath;
	}

	public getSrcFilePath() : string | undefined {
		return this.srcFilePath;
	}

	public getExtFilePath() : string | undefined {
		return this.extFilePath;
	}

	public getText() : string | undefined {
		return this.text;
	}

	public getUser() : string | undefined {
		return this.user;
	}

	public getNumber() : string | undefined {
		return this.number;
	}

	private parseDidactUrl(incoming: string) : void {
		const parsedUrl = new url(incoming, true);
		const query = parsedUrl.query;

		if (query.commandId) {
			this.commandId = getValue(query.commandId);
		}
		if (!this.commandId) {
			return;
		} else {
			if (query.projectFilePath) {
				this.projectFilePath = getValue(query.projectFilePath);
			} else if (query.srcFilePath && this.context.extensionPath) {
				this.srcFilePath = getValue(query.srcFilePath);
			} else if (query.extFilePath) {
				this.extFilePath = getValue(query.extFilePath);
			}

			if (query.completion) {
				this.completionMessage = getValue(query.completion);
			}

			if (query.error) {
				this.errorMessage = getValue(query.error);
			}

			if (query.text) {
				this.text = getValue(query.text);
			} else if (query.user) {
				this.user = getValue(query.user);
			}

			if (query.number) {
				this.number = getValue(query.number);
			}
		}
	}
}
