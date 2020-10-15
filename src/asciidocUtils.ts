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

const asciidoctor = require('asciidoctor')();

export function getADParser(): any {
	return asciidoctor;
}

export function parseADtoHTML(content: string, baseDir?: string): any {
	// note: base_dir is required to handle adoc includes
	const opts1 = { 
		safe: 'safe',
		'base_dir': baseDir,
		'attributes': {
			'showtitle': true,
			'icons': 'font'
	}};
	const opts2 = { 
		safe: 'safe',
		'attributes': {
			'showtitle': true,
			'icons': 'font'
	}};
	if (baseDir) {
		const html = asciidoctor.convert(content, opts1);
		return html;
	} else {
		const html = asciidoctor.convert(content, opts2);
		return html;
	}
}
