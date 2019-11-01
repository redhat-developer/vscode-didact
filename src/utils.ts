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

// simple file path comparison
export function pathEquals(path1: string, path2: string): boolean {
	if (process.platform !== 'linux') {
		path1 = path1.toLowerCase();
		path2 = path2.toLowerCase();
	}
	return path1 === path2;
}

// returns the first workspace root folder
export function getWorkspacePath():string | undefined {
	if(vscode.workspace.workspaceFolders !== undefined && vscode.workspace.workspaceFolders.length > 0) {
		return vscode.workspace.workspaceFolders[0].uri.fsPath;
	} else {
		return undefined;
	}
}

// utility method to quickly handle array input coming back from some functions
export function getValue(input : string | string[]) : string | undefined {
	if (input) {
		if (Array.isArray(input)) {
			return input[0]; // grab the first one for now
		} else {
			return input as string;
		}
	}
	return undefined;
}

// utility method to do a simple delay of a few ms
export function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}
