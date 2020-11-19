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

import { expect } from 'chai';
import * as mdUtils from '../../markdownUtils';

const BASIC_EXAMPLE = `# Document Title

An example of a basic http://asciidoc.org[AsciiDoc] document.

abracadabra`;

const TASKLIST_EXAMPLE = `1. [x] checked ordered 1
2. [ ] unchecked ordered 2
3. [x] checked ordered 3
4. [ ] unchecked ordered 4`;

suite('Markdown Utils Test Suite', () => {

	test('get the markdown parser', () => {
		// this should never be null
		expect(mdUtils.getMDParser()).to.not.be.null;
	});

	test('that we can parse md to html', () => {
		const htmlOutput = mdUtils.parseMDtoHTML(BASIC_EXAMPLE);
		expect(htmlOutput).to.include(`<h1>Document Title</h1>`);
		expect(htmlOutput).to.include(`<p>abracadabra</p>`);
	});

	test('that we can parse md with tasklist to html and cleaned up input tags', () => {
		const htmlOutput = mdUtils.parseMDtoHTML(TASKLIST_EXAMPLE);
		expect(htmlOutput).to.include(`<input class="task-list-item-checkbox" type="checkbox">`);
		expect(htmlOutput).to.include(`<input class="task-list-item-checkbox" checked="" type="checkbox">`);
	});

});
