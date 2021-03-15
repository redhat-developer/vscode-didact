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

// This script will be run within the webview itself
(
function () {

	//connect to the vscode api
	const vscode = acquireVsCodeApi();

	const oldState = vscode.getState();
	let oldBody = oldState ? oldState.oldbody : '';
	if (oldBody) {
		const textFromBase64 = window.btoa(oldBody);
		document.body = decodeURI(textFromBase64);
	}
	let oldTitle = oldState ? oldState.oldTitle : '';
	if (oldTitle) {
		this.title = oldTitle;
	}

	document.body.addEventListener('click', event => {
		let node = event && event.target;
		while (node) {
			if (node.href) {
				let hrefValue = node.getAttribute('href');
				if (!hrefValue.startsWith('didact')) {
					return; // if it's not a didact link, we don't need to worry about it
				}

				// Handle click here by posting data back to VS Code
				// for your extension to handle
				vscode.postMessage({ command: 'link', text: hrefValue });

				// check the box
				let element = node.parentNode.querySelector('input');
				if (element) {
					element.checked = true;
					if (document.body) {
						vscode.postMessage({ command: 'update', text: document.body });
						updateState();
					}
				}				

				event.preventDefault();

				return;
			}
			node = node.parentNode;
		}
	}, true);

	// clunky, but better than passing in all of these as part of the message? 
	const requirementCommandLinks = [
		'didact://?commandId=vscode.didact.extensionRequirementCheck', 
		'didact://?commandId=vscode.didact.requirementCheck',
		'didact://?commandId=vscode.didact.workspaceFolderExistsCheck',
		'didact://?commandId=vscode.didact.cliCommandSuccessful'
	];

	function collectElements(tagname) {
		var elements = [];
		var links = document.getElementsByTagName(tagname);
		for (let element of links) {
			elements.push(element);
		}
		return elements;
	}

	function updateState(passedUri) {
		const textToCache = '<!DOCTYPE HTML>' + '\n' + document.documentElement.outerHTML;
		const encodedText = encodeURI(textToCache);
		const textToBase64 = window.btoa(encodedText);
		vscode.setState( { oldBody: textToBase64, oldTitle : this.title, oldUri : passedUri });
	}

	function handleSingleRequirementCheck(element, isAvailable, requirementName) {
		// add check for adoc div/p requirement label
		if (element.tagName.toLowerCase() === 'div' && element.childNodes.length > 0) {
			let list = element.getElementsByTagName('em');
			if (list.length > 0) {
				element = list[0];
			}
		}
		
		if (element) {
			let green = "green";
			let red = "red";
			if (String(isAvailable).toLowerCase() === 'true') {
				element.style.color = green;
				element.textContent = `Status: Available`;
			} else {
				element.style.color = red;
				element.textContent = `Status: Unavailable`;
			}
		}
		console.log(`${requirementName} is available: ${isAvailable}`);
		updateState();		
	}

	function processAllRequirements() {
		var links = collectElements("a");
		for (let linkElements of links) {
			if (linkElements.getAttribute('href')) {
				const href = linkElements.getAttribute('href');
				for(let check of requirementCommandLinks) {
					if (href.startsWith(check)) {
						linkElements.click();
					}
				}
			}
		}
		updateState();		
	}

	// Handle messages sent from the extension to the webview
	window.addEventListener('message', event => {
		const message = event.data; // The json data that the extension sent
		const json = JSON.parse(message);
		const requirementName = json.requirementName;
		const isAvailable = json.result;
		const passedUri = json.oldUri;

		let element = document.getElementById(requirementName);

		switch (json.command) {
			case 'requirementCheck':
				handleSingleRequirementCheck(element, isAvailable, requirementName);
				break;

			case 'allRequirementCheck':
				processAllRequirements();
				break;

			case 'setState':
				updateState(passedUri);
				break;
		}
	});
}());