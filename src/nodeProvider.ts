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
import * as vscode from 'vscode';
import * as utils from './utils';

export class DidactNodeProvider implements vscode.TreeDataProvider<TreeNode> {

	private _onDidChangeTreeData: vscode.EventEmitter<TreeNode | undefined> = new vscode.EventEmitter<TreeNode | undefined>();
	readonly onDidChangeTreeData: vscode.Event<TreeNode | undefined> = this._onDidChangeTreeData.event;

	protected treeNodes: TreeNode[] = [];
	protected retrieveTutorials : boolean = true;

	constructor() {}

	// clear the tree
	public resetList(): void {
		this.treeNodes = [];
	}

	// set up so we don't pollute test runs with camel k integrations
	public setRetrieveIntegrations(flag:boolean): void {
		this.retrieveTutorials = flag;
	}

	// get the list of children for the node provider
	public getChildren(element?: TreeNode): TreeNode[] {
        if (!element) {
            return this.treeNodes;
        } else {
            // assume it's a category
            if (element.label && !(element instanceof TutorialNode)) {
                return this.processTutorialsForCategory(element.label);
            }   
        }
        return [];
	}

	// add a child to the list of nodes
	public addChild(oldNodes: TreeNode[] = this.treeNodes, newNode: TreeNode, disableRefresh : boolean = false ): Promise<TreeNode[]> {
		return new Promise<TreeNode[]>( async (resolve, reject) => {
			if (oldNodes) {
				oldNodes.push(newNode);
				if (!disableRefresh) {
					await this.refresh().catch(err => reject(err));
				}
				resolve(oldNodes);
			}
			reject(new Error("Internal problem. TreeView is not initialized correctly."));
		});
	}

	// This method isn't used by the view currently, but is here to facilitate testing
	public removeChild(oldNodes: TreeNode[] = this.treeNodes, oldNode: TreeNode, disableRefresh : boolean = false ): Promise<TreeNode[]> {
		return new Promise<TreeNode[]>( async (resolve, reject) => {
			if (oldNodes) {
				const index = oldNodes.indexOf(oldNode);
				if (index !== -1) {
					oldNodes.splice(index, 1);
					if (!disableRefresh) {
						await this.refresh().catch(err => reject(err));
					}
				}
				resolve(oldNodes);
			}
			reject(new Error("Internal problem. TreeView is not initialized correctly."));
		});
	}

	// trigger a refresh event in VSCode
	public refresh(): Promise<void> {
		return new Promise<void>( async (resolve, reject) => {
			this.resetList();
			let inaccessible = false;
			if (this.retrieveTutorials) {
                this.processRegisteredTutorials();
			}
			this._onDidChangeTreeData.fire();
			resolve();
		});
	}

	getTreeItem(node: TreeNode): vscode.TreeItem {
		return node;
	}

	doesNodeExist(oldNodes: TreeNode[], newNode: TreeNode): boolean {
		for (let node of oldNodes) {
			if (node.label === newNode.label) {
				return true;
			}
		}
		return false;
	}

	// process the text-based list we get back from the kubectl command
	processRegisteredTutorials(): void {
        let categories : string[] | undefined = utils.getDidactCategories();
        if (categories) {
            for (var category of categories) {
                let newNode = new TreeNode("string", category, undefined, vscode.TreeItemCollapsibleState.Collapsed);
                if (!this.doesNodeExist(this.treeNodes, newNode)) {
                    this.addChild(this.treeNodes, newNode, true);
                }
            }
        }
    }

    processTutorialsForCategory(category: string | undefined) : TreeNode[] {
		let children : TutorialNode[] = [];
		if (category) {
        	let tutorials : string[] | undefined = utils.getTutorialsForCategory(category);
        	if (tutorials) {
	            for (var tutorial of tutorials) {
					let tutUri : string | undefined = utils.getUriForDidactNameAndCategory(tutorial, category);
					let newNode = new TutorialNode("string", tutorial, tutUri, vscode.TreeItemCollapsibleState.None);
					newNode.contextValue = 'TutorialNode';
                	if (!this.doesNodeExist(children, newNode)) {
	                    this.addChild(children, newNode, true);
                	}
            	}
			}
		}
        return children;
    }    
  
}

// simple tree node for our integration view
export class TreeNode extends vscode.TreeItem {
	type: string;
	uri : string | undefined;

	constructor(
		type: string,
		label: string,
		uri: string | undefined,
		collapsibleState: vscode.TreeItemCollapsibleState
	) {
		super(label, collapsibleState);
		this.type = type;
		this.uri = uri;
//		this.iconPath = this.getIconForPodStatus(this.status);

		// let namespace: string = config.getNamespaceconfig() as string;
		// if (namespace) {
		// 	this.tooltip = `Status: ${this.status} \nNamespace: ${namespace}`;
		// } else {
		// 	this.tooltip = `Status: ${this.status}`;
		// }
	}
}

export class TutorialNode extends TreeNode {

}