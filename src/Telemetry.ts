/**
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License", destination); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { TelemetryService, getTelemetryService, TelemetryEvent } from "@redhat-developer/vscode-redhat-telemetry/lib";
import {getFileExtension} from './utils';

export const telemetryService: Promise<TelemetryService> = getTelemetryService('redhat.vscode-didact');
 
export async function getTelemetryServiceInstance(): Promise<TelemetryService> {
    return telemetryService;
}

export async function sendCommandTracking(commandId: string) {
	const telemetryEvent: TelemetryEvent = {
		type: 'track',
		name: 'didact.didactCommand',
		properties: {
			identifier: commandId
		}
	};
	(await telemetryService).send(telemetryEvent);
}

export async function sendDidactOpenTypeTracking(filePath: string) {
    const fileExt = getFileExtension(filePath);
	const telemetryEvent: TelemetryEvent = {
		type: 'track',
		name: 'didact.didactOpenFileExtension',
		properties: {
			didactFileExtension: fileExt
		}
	};
	(await telemetryService).send(telemetryEvent);
}
