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
(function () {

	//connect to the vscode api
	const vscode = acquireVsCodeApi();
	
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
					}
				}				

				event.preventDefault();

				return;
			}
			node = node.parentNode;
		}
	}, true);

	// Handle messages sent from the extension to the webview
	window.addEventListener('message', event => {
		const message = event.data; // The json data that the extension sent
		const json = JSON.parse(message);
		switch (json.command) {
			case 'requirementCheck':
				const requirementName = json.requirementName;
				const isAvailable = json.result;

				let element = document.getElementById(requirementName);
				if (element) {
					let message = 'Not currently avaialable';
					let color = "green";
					if (String(isAvailable).toLowerCase() === 'true') {
						message = 'Available';
						element.style.color = color;
					}
					element.textContent = `Status: ${message}`;
				}
				console.log(`${requirementName} is available: ${isAvailable}`);
				break;
		}
	});
}());