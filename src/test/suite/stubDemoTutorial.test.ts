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

import { expect } from 'chai';
import { window, commands, env, Uri, Terminal, Disposable } from 'vscode';
import { START_DIDACT_COMMAND, sendTerminalText, gatherAllCommandsLinks, getContext } from '../../extensionFunctions';
import { didactManager } from '../../didactManager';
import { DidactUri } from '../../didactUri';
import { handleText } from '../../commandHandler';
import { waitUntil } from 'async-wait-until';
import { fail } from 'assert';

const testMD = Uri.parse('vscode://redhat.vscode-didact?extension=demos/markdown/didact-demo.didact.md');

const delayTime = 2500;
const COMMAND_WAIT_TIMEOUT = 15000;
const COMMAND_WAIT_RETRY = 1500;
const TERMINAL_WAIT_RETRY = 2000;

suite('stub out a tutorial', () => {

	let disposables: Disposable[] = [];

	teardown(() => {
		disposables.forEach(d => d.dispose());
		disposables.length = 0;
	});

	test('that we can send an echo command to the terminal and get the response', async () => {
		const name = 'echoTerminal';
		const text = `echo \"Hello World ${name}\"`;
		const result = `Hello World echoTerminal`;
		const winResult = [
			`Hello`,
			`World`,
			`echoTerminal`
		];
		await validateTerminalResponseWin(name, text, result);

		// if (process.platform === 'win32') {
		// 	await validateTerminalResponseWin(name, text, winResult);
		// } else {
		// 	await validateTerminalResponse(name, text, result);
		// }
	});

	test('that we can get a response from each command in the demo tutorial', async () => {
		await commands.executeCommand(START_DIDACT_COMMAND, testMD);
		if (didactManager.active()) {
			const commandsToTest: any[] = gatherAllCommandsLinks().filter( (href) => href.match(/=vscode.didact.sendNamedTerminalAString&/g));
			expect(commandsToTest).to.not.be.empty;
			commandsToTest.forEach(async (href: string) => {
				const ctxt = getContext();
				if (ctxt) {
					const testUri = new DidactUri(href, ctxt);
					const textToParse = testUri.getText();
					const userToParse = testUri.getUser();
					let outputs : string[] = [];
					if (textToParse) {
						handleText(textToParse, outputs);
					} else if (userToParse) {
						handleText(userToParse, outputs);
					}
					expect(outputs).length.to.be.at.least(2);
					const terminalName = outputs[0];
					const terminalString = outputs[1];
					await validateTerminalResponse(terminalName, terminalString);
				}
			});
		}
	});

	async function validateTerminalResponse(terminalName : string, terminalText : string, terminalResponse? : string) {
		console.log(`validateTerminalResponse terminal ${terminalName} executing text ${terminalText}`);
		const term = window.createTerminal(terminalName);
		expect(term).to.not.be.null;
		if (term) {
			console.log(`-current terminal = ${term?.name}`);
			await sendTerminalText(terminalName, terminalText);

			await waitUntil(async () => {
				await focusOnNamedTerminal(terminalName);
				return terminalName === window.activeTerminal?.name;
			}, TERMINAL_WAIT_RETRY);

			try {
				const predicate = async () => {
					const result: string = await getActiveTerminalOutput();
					return result.includes(getExpectedTextInTerminal());
				};
				await waitUntil(predicate, { timeout: COMMAND_WAIT_TIMEOUT, intervalBetweenAttempts: COMMAND_WAIT_RETRY });
			} catch (error){
				console.log(`Searching for ${getExpectedTextInTerminal()} but not found in current content of active terminal ${window.activeTerminal?.name} : ${await getActiveTerminalOutput()}`);
				fail(error);
			}
			findAndDisposeTerminal(terminalName);
		}

		function getExpectedTextInTerminal() {
			return terminalResponse ? terminalResponse : terminalText;
		}
	}

	async function validateTerminalResponseWin(terminalName : string, terminalText : string, terminalResponse : string) {
		let terminalData:string[] = [];
		console.log(`validateTerminalResponse terminal ${terminalName} executing text ${terminalText}`);
		const term = window.createTerminal(terminalName);
		expect(term).to.not.be.null;
		if (term) {
			console.log(`-current terminal = ${term?.name}`);
			await sendTerminalText(terminalName, terminalText);
			await waitUntil(async () => {
				await focusOnNamedTerminal(terminalName);
				return terminalName === window.activeTerminal?.name;
			}, 1000);
			try {
				const predicate = async () => {
					const result: string = await getActiveTerminalOutput();
					await commands.executeCommand('workbench.action.terminal.clear');
					if (result.trim().length > 0) terminalData.push(result.trim());
					return true;
				};
				var numberOfTimes = 5;
				const delay = 1000;
				for (let i = 0; i < numberOfTimes; i++) {
					await predicate();
					await new Promise((res) => { setTimeout(res, delay); });
				}
				console.log(`-terminal output = ${terminalData}`);

				const foundIt = searchStringInArray(terminalResponse, terminalData);
				if (foundIt > -1) {
					return;
				} else {
					fail(`Searching for ${terminalResponse} but not found in current content of active terminal ${window.activeTerminal?.name} : ${terminalData}`);
				};
			} catch (error){
				fail(error);
			}
			findAndDisposeTerminal(terminalName);
		}	
	}

	function searchStringInArray (strToFind : string, strArray : string[]) : number {
		for (var j=0; j<strArray.length; j++) {
			if (strArray[j].match(strToFind)) return j;
		}
		return -1;
	}

	async function getActiveTerminalOutput() : Promise<string> {
		const term = window.activeTerminal;
		console.log(`-current terminal = ${term?.name}`);
		await executeAndWait('workbench.action.terminal.selectAll');
		await delay(delayTime);
		await executeAndWait('workbench.action.terminal.copySelection');
		await executeAndWait('workbench.action.terminal.clearSelection');	
		const clipboard_content = await env.clipboard.readText();
		return clipboard_content.trim();
	}

	function delay(ms: number) {
		return new Promise( resolve => setTimeout(resolve, ms) );
	}

	async function executeAndWait(command: string): Promise<void> {
		await commands.executeCommand(command);
		delay(200);
	}

	function getNamedTerminal(terminalName : string): Terminal | undefined {
		return window.terminals.filter(term => term.name === terminalName)[0];
	}

	function findAndDisposeTerminal(terminalName: string) : void {
		const term = getNamedTerminal(terminalName);
		if (term) {
			term.dispose();
		}
	}

	async function focusOnNamedTerminal(terminalName : string) : Promise<void> {
		let term = window.activeTerminal;
		while (term?.name != terminalName) {
			await commands.executeCommand('workbench.action.terminal.focusNext');
			term = window.activeTerminal;
		}
	}

});
