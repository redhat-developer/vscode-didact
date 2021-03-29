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
import * as extensionFunctions from './extensionFunctions';
import * as path from 'path';

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
	public async getChildren(element?: any): Promise<any[]> {
		if (!element) {
			return this.treeNodes;
		} else if (element instanceof TutorialNode) {
			return await this.processHeadingsForTutorial(element.uri);
		} else {
			// assume it's a category
			if (element.label && !(element instanceof TutorialNode)) {
				const tutorialCategory = retrieveTreeItemName(element);
				return await this.processTutorialsForCategory(tutorialCategory);
			}   
		}
		return [];
	}

	// add a child to the list of nodes
	public addChild(newNode: any, disableRefresh = false, oldNodes: any[] = this.treeNodes ): any[] {
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

	public getParent(element : TreeNode) : TreeNode | undefined {
		if (element instanceof TutorialNode) {
			const tutorial = element as TutorialNode;
			if (tutorial.category) {
				return this.findCategoryNode(tutorial.category);
			}
		}
		return undefined;
	}

	getTreeItem(node: TreeNode): vscode.TreeItem {
		return node;
	}

	doesNodeExist(oldNodes: any[], newNode: any): boolean {
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
				const newNode = new TreeNode(category, category, undefined, vscode.TreeItemCollapsibleState.Collapsed);
				if (!this.doesNodeExist(this.treeNodes, newNode)) {
					this.addChild(newNode, true, this.treeNodes);
				}
			}
		}
	}

	async processTutorialsForCategory(category: string | undefined) : Promise<TreeNode[]> {
		const children : TutorialNode[] = [];
		if (category) {
			const tutorials : string[] | undefined = utils.getTutorialsForCategory(category);
			if (tutorials) {
				for (const tutorial of tutorials) {
					let hasChildren = vscode.TreeItemCollapsibleState.None;
					const tutUri : string | undefined = utils.getUriForDidactNameAndCategory(tutorial, category);
					let tooltip : string | undefined = undefined;
					if (tutUri) {
						const timeCount = await extensionFunctions.computeTimeForDidactFileUri(vscode.Uri.parse(tutUri));
						if (timeCount > -1) {
							tooltip = `(${timeCount} mins)`;
							hasChildren = vscode.TreeItemCollapsibleState.Collapsed;
						}
					}
			
					const newNode = new TutorialNode(category, tutorial, tutUri, hasChildren, tooltip);
					newNode.contextValue = 'TutorialNode';
					if (!this.doesNodeExist(children, newNode)) {
						this.addChild(newNode, true, children);
					}
				}
			}
		}
		return children;
	}

	async processHeadingsForTutorial(tutUri: string | undefined) : Promise<HeadingNode[]> {
		const children : HeadingNode[] = [];
		if (tutUri) {
			const headings : any[] | undefined = await extensionFunctions.getHeadingsForDidactFileUri(vscode.Uri.parse(tutUri));
			if (headings) {
				for (const heading of headings) {
					const timeAttr = heading.getAttribute("time");
					const timeValue = Number(timeAttr);
					const title = heading.rawText;
					const newNode = new HeadingNode(title, tutUri, `(~${timeValue} mins)`);
					newNode.contextValue = 'HeadingNode';
					if (!this.doesNodeExist(children, newNode)) {
						this.addChild(newNode, true, children);
					}
				}
			}
		}
		return children;
	}

	findCategoryNode(category : string) : TreeNode | undefined {
		const nodeToFind = new TreeNode(category, category, undefined, vscode.TreeItemCollapsibleState.Collapsed);
		if (this.doesNodeExist(this.treeNodes, nodeToFind)) {
			return nodeToFind;
		}
		return undefined;
	}
	
	async findTutorialNode(category : string, tutorialName : string ) : Promise<TreeNode | undefined> {
		const catNode = this.findCategoryNode(category);
		if (catNode) {
			const treeItems : TreeNode[] = await this.getChildren(catNode);
			let foundNode : TreeNode | undefined = undefined;
			treeItems.forEach(element => {
				if (element.label === tutorialName && element.category === category) {
					foundNode = element;
				}
			});
			return foundNode;
		}
		return undefined;
	}
}

// simple tree node for our tutorials view
export class TreeNode extends vscode.TreeItem {
	category: string;
	uri : string | undefined;
	constructor(
		type: string,
		label: string,
		uri: string | undefined,
		collapsibleState: vscode.TreeItemCollapsibleState
	) {
		super(label, collapsibleState);
		this.category = type;
		this.uri = uri;
	}
}

export class TutorialNode extends TreeNode {
	constructor(
		category: string,
		label: string,
		uri: string | undefined,
		collapsibleState: vscode.TreeItemCollapsibleState,
		inTooltip? : string | undefined
	) {
		super(category, label, uri, collapsibleState);
		const localIconPath = vscode.Uri.file(path.resolve(extensionFunctions.getContext().extensionPath, 'icon/logo.svg'));
		this.iconPath = localIconPath;
		if (inTooltip) {
			//this.tooltip = inTooltip;
			this.description = inTooltip;
		}
	}
}

// simple heading node for an outline of the headings in our tutorial
export class HeadingNode extends vscode.TreeItem {
	uri : string | undefined;
	constructor(
		label: string,
		uri: string | undefined,
		description : string | undefined
	) {
		super(label, vscode.TreeItemCollapsibleState.None);
		this.uri = uri;
		this.description = description;
	}
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
