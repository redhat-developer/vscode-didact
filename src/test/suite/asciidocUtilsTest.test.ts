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
import * as extensionFunctions from '../../extensionFunctions';
import * as path from 'path';
import { expect } from 'chai';
import * as Utils from './Utils';
import * as adocutils from '../../asciidocUtils';

const BASIC_EXAMPLE = `= Document Title

An example of a basic http://asciidoc.org[AsciiDoc] document.

That's all, folks!`;

suite('AsciiDoc Utils Test Suite', () => {

	setup(() => {
		Utils.ensureExtensionActivated();
	});

	test('open an asciidoc file', async () => {
		const testFile = path.resolve(__dirname, '..', '..', '..', './demos/asciidoc/didact-demo.didact.adoc');
		const testFileUri = vscode.Uri.file(testFile);
		const content = await extensionFunctions.getDataFromFile(testFileUri);
		expect(content).to.not.equal(null);
		expect(content).to.include('Ideas or want to contribute?');
	});

	test('open an asciidoc file with an include', async () => {
		const testFile = path.resolve(__dirname, '..', '..', '..', './src/test/data/includetext.didact.adoc');
		const testFileUri = vscode.Uri.file(testFile);
		const content = await extensionFunctions.getDataFromFile(testFileUri);
		expect(content).to.not.equal(null);
		expect(content).to.include('The quick brown fox jumps over the lazy dog.');
	});

	test('get the adoc parser', () => {
		expect(adocutils.getADParser()).to.not.be.null;
	});

	test('that we can parse adoc to html', () => {
		const htmlOutput = adocutils.parseADtoHTML(BASIC_EXAMPLE);
		expect(htmlOutput).to.include(`<h1>Document Title</h1>`);
		expect(htmlOutput).to.include(`<p>That&#8217;s all, folks!</p>`);
	});

	test('that we can parse adoc to html with an include', async () => {
		const testFile = path.resolve(__dirname, '..', '..', '..', './src/test/data/includetext.didact.adoc');
		const content = await extensionFunctions.getDataFromFile(vscode.Uri.file(testFile));
		expect(content).to.include(`The quick brown fox jumps over the lazy dog.`);
	});
});
