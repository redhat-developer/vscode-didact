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
	protected retrieveTutorials = true;

	// clear the tree
	public resetList(): void {
		this.treeNodes = [];
	}

	// set up so we don't pollute test runs with registered tutorials
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
				const tutorialCategory = retrieveTreeItemName(element);
                return this.processTutorialsForCategory(tutorialCategory);
            }   
        }
        return [];
	}

	// add a child to the list of nodes
	public addChild(newNode: TreeNode, disableRefresh = false, oldNodes: TreeNode[] = this.treeNodes ): TreeNode[] {
		if (oldNodes) {
			oldNodes.push(newNode);
			if (!disableRefresh) {
				this.refresh();
			}
		}
		return oldNodes;		
	}

	// This method isn't used by the view currently, but is here to facilitate testing
	public removeChild(oldNode: TreeNode, disableRefresh = false, oldNodes: TreeNode[] = this.treeNodes ): TreeNode[] {
		if (oldNodes) {
			const index = oldNodes.indexOf(oldNode);
			if (index !== -1) {
				oldNodes.splice(index, 1);
				if (!disableRefresh) {
					this.refresh();
				}
			}
		}
		return oldNodes;
	}

	// trigger a refresh event in VSCode
	public refresh(): void {
		this.resetList();
		if (this.retrieveTutorials) {
			this.processRegisteredTutorials();
		}
		this._onDidChangeTreeData.fire(undefined);
	}

	getTreeItem(node: TreeNode): vscode.TreeItem {
		return node;
	}

	doesNodeExist(oldNodes: TreeNode[], newNode: TreeNode): boolean {
		for (const node of oldNodes) {
			if (node.label === newNode.label) {
				return true;
			}
		}
		return false;
	}

	// process the list of registered tutorials 
	processRegisteredTutorials(): void {
        const categories : string[] | undefined = utils.getDidactCategories();
        if (categories) {
            for (const category of categories) {
                const newNode = new TreeNode("string", category, undefined, vscode.TreeItemCollapsibleState.Collapsed);
                if (!this.doesNodeExist(this.treeNodes, newNode)) {
                    this.addChild(newNode, true, this.treeNodes);
                }
            }
        }
    }

    processTutorialsForCategory(category: string | undefined) : TreeNode[] {
		const children : TutorialNode[] = [];
		if (category) {
			const tutorials : string[] | undefined = utils.getTutorialsForCategory(category);
			if (tutorials) {
				for (const tutorial of tutorials) {
					const tutUri : string | undefined = utils.getUriForDidactNameAndCategory(tutorial, category);
					const newNode = new TutorialNode("string", tutorial, tutUri, vscode.TreeItemCollapsibleState.None);
					newNode.contextValue = 'TutorialNode';
					if (!this.doesNodeExist(children, newNode)) {
						this.addChild(newNode, true, children);
					}
				}
			}
		}
        return children;
	}
	
}

// simple tree node for our tutorials view
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
	}
}

export class TutorialNode extends TreeNode {
	// empty
}

function retrieveTreeItemName(selection: TreeNode) {
	const treeItemName: string | vscode.TreeItemLabel | undefined = selection.label;
	if (treeItemName === undefined) {
		return "";
	} else if(typeof treeItemName === "string") {
		return treeItemName;
	} else {
		return treeItemName.label;
	}
}
