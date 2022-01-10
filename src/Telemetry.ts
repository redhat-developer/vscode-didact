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

import { TelemetryEvent, TelemetryService } from "@redhat-developer/vscode-redhat-telemetry/lib";
import {getFileExtension} from './utils';

export class DidactTelemetry {

	private telemetryService: Promise<TelemetryService>;

	public constructor(telemetryService: Promise<TelemetryService>) {
		this.telemetryService = telemetryService;
	}

	public async getTelemetryServiceInstance(): Promise<TelemetryService> {
		return this.telemetryService;
	}

	public async sendCommandTracking(commandId: string): Promise<void> {
		const telemetryEvent: TelemetryEvent = {
			type: 'track',
			name: 'didact.didactCommand',
			properties: {
				identifier: commandId
			}
		};
		(await this.telemetryService).send(telemetryEvent);
	}

	public async sendDidactOpenTypeTracking(filePath: string): Promise<void> {
		const fileExt = getFileExtension(filePath);
		const telemetryEvent: TelemetryEvent = {
			type: 'track',
			name: 'didact.didactOpenFileExtension',
			properties: {
				didactFileExtension: fileExt
			}
		};
		(await this.telemetryService).send(telemetryEvent);
	}
}
