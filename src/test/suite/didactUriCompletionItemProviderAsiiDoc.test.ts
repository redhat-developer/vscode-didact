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
import { DidactUriCompletionItemProviderAsciiDoc } from "../../didactUriCompletionItemProviderAsciiDoc";

suite("Didact URI completion for AsciiDoc", function () {

	let emptyContent = '';
	let notEmptyContent = 'this is text with a didact://? link stuffed inside';

	test("no result for uri completion when no didact link in line", () => {
		expect(new DidactUriCompletionItemProviderAsciiDoc().provideCompletionItemsForDidactProtocol(emptyContent)).to.be.empty;
	});

	test("should get result for uri completion when didact link in line", () => {
		const expectedUriResult = 13;
		expect(new DidactUriCompletionItemProviderAsciiDoc().provideCompletionItemsForDidactProtocol(notEmptyContent).length).to.equal(expectedUriResult);
	});

	test("should get result for outside uri completion when no didact link in line", () => {
		const expectedOutsideUriResult = 3;
		expect(new DidactUriCompletionItemProviderAsciiDoc().provideCompletionItemsOutsideDidactURI(emptyContent).length).to.equal(expectedOutsideUriResult);
	});

	test("should not get result for outside uri completion when didact link in line", () => {
		expect(new DidactUriCompletionItemProviderAsciiDoc().provideCompletionItemsOutsideDidactURI(notEmptyContent)).to.be.empty;
	});

});
