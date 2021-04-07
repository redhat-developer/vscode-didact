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
 import { expect } from 'chai';
 import {getContext} from '../../extensionFunctions';
 import {TreeNode, TutorialNode, HeadingNode} from '../../nodeProvider';
 import {didactTutorialsProvider, revealTreeItem} from '../../extension';
 
 suite('Node provider test suite', () => {
	const tutorialName = 'HelloWorld with JavaScript in Three Steps';
	const tutorialCategory = 'Didact';
	const tutorialUri = vscode.Uri.file(getContext().asAbsolutePath('./demos/markdown/helloJS/helloJS.didact.md'));
	const headingName = 'Step 2: Create Our First JavaScript project';

	test('Verify that we get null as the parent of the category', async () => {
		const categoryNode = new TreeNode(tutorialCategory, tutorialCategory, undefined, vscode.TreeItemCollapsibleState.None);
		await revealTreeItem(categoryNode);
		const parent = await didactTutorialsProvider.getParent(categoryNode);
		expect(parent).to.be.null;
	});	

	test('Verify that we get the category as the parent of the tutorial', async () => {
		const tutorialNode = new TutorialNode(tutorialCategory, tutorialName, tutorialUri.fsPath, vscode.TreeItemCollapsibleState.Collapsed);
		await revealTreeItem(tutorialNode);
		const parent = await didactTutorialsProvider.getParent(tutorialNode);
		expect(parent).to.not.be.null;
		expect(parent?.label).to.deep.equal(tutorialCategory);
	});	

	test('Verify that we get the tutorial as the parent of the heading', async () => {
		const headingNode = new HeadingNode(tutorialCategory, headingName, tutorialUri.fsPath, undefined);
		await revealTreeItem(headingNode);
		const parent = await didactTutorialsProvider.getParent(headingNode);
		expect(parent).to.not.be.null;
		expect(parent?.label).to.deep.equal(tutorialName);
	});	
});
