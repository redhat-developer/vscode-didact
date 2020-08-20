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
import { DidactUri } from '../../didactUri';
import { extensionFunctions } from '../../extensionFunctions';

suite("Didact URI parsing tests", function () {

	test("ensure that we can get the command Id from the parsed didact uri", () => {
		let ctx = extensionFunctions.getContext();
		let didactUri = new DidactUri("didact://?commandId=test", ctx);
		expect(didactUri.getCommandId()).equals('test');
	});	

	test("ensure that we can get the number from the parsed didact uri", () => {
		let ctx = extensionFunctions.getContext();
		let didactUri = new DidactUri("didact://?commandId=testCommand&text=testText&number=2", ctx);
		expect(didactUri.getCommandId()).equals('testCommand');
		expect(didactUri.getText()).equals('testText');
		expect(didactUri.getNumber()).equals('2');
	});	

});