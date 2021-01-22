'use strict';
import { WebviewPanel, WebviewPanelSerializer, ExtensionContext, Uri } from 'vscode';
import { DidactPanel } from './didactPanel';

export class DidactPanelSerializer implements WebviewPanelSerializer {
    
    private _context: ExtensionContext;

    constructor(context: ExtensionContext) {
        this._context = context;
    }

    public async deserializeWebviewPanel(webviewPanel: WebviewPanel, state: any) : Promise<void> {
        if (state) {
            DidactPanel.revive(this._context, Uri.parse(state.uri), webviewPanel);
        }
    }
}