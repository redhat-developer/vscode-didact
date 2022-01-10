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
import * as path from 'path';
import { computeTimeForDidactFileUri, getActualUri, getContext, getTimeElementsForDidactFileUri, isAsciiDoc, sendTextToOutputChannel } from './extensionFunctions';
import { HTMLElement } from 'node-html-parser';

export class DidactNodeProvider implements vscode.TreeDataProvider<SimpleNode> {

	private _onDidChangeTreeData: vscode.EventEmitter<SimpleNode | undefined> = new vscode.EventEmitter<SimpleNode | undefined>();
	readonly onDidChangeTreeData: vscode.Event<SimpleNode | undefined> = this._onDidChangeTreeData.event;

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
	public async getChildren(element?: SimpleNode): Promise<SimpleNode[]> {
		if (!element) {
			return this.treeNodes;
		} else if (element instanceof TutorialNode) {
			return this.processHeadingsForTutorial(element.uri, element.category);
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
	public addChild(newNode: SimpleNode, disableRefresh = false, oldNodes: SimpleNode[] = this.treeNodes ): SimpleNode[] {
		if (oldNodes) {
			oldNodes.push(newNode);
			if (!disableRefresh) {
				this.refresh();
			}
		}
		return oldNodes;		
	}

	// This method isn't used by the view currently, but is here to facilitate testing
	public removeChild(oldNode: SimpleNode, disableRefresh = false, oldNodes: SimpleNode[] = this.treeNodes ): SimpleNode[] {
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

	public async getParent(element : SimpleNode) : Promise<SimpleNode | null> {
		if (element instanceof TutorialNode) {
			const tutorial : TutorialNode = element;
			if (tutorial.category) {
				return Promise.resolve(this.findCategoryNode(tutorial.category));
			}
		}
		if (element instanceof HeadingNode) {
			if (element.category && element.uri) {
				return this.findParentTutorialNode(element.category, element.uri);
			}
		}
		// Return null if element is a category and a child of root
		return Promise.resolve(null);
	}

	getTreeItem(node: SimpleNode): vscode.TreeItem {
		return node;
	}

	getCategory(oldNodes: SimpleNode[], newNode: SimpleNode): SimpleNode | null {
		for (const node of oldNodes) {
			if (node.label === newNode.label) {
				return node;
			}
		}
		return null;
	}


	doesNodeExist(oldNodes: SimpleNode[], newNode: SimpleNode): boolean {
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

	async processTutorialsForCategory(category: string | undefined) : Promise<SimpleNode[]> {
		const children : SimpleNode[] = [];
		if (category) {
			const tutorials : string[] | undefined = utils.getTutorialsForCategory(category);
			if (tutorials) {
				for (const tutorial of tutorials) {
					let hasChildren = vscode.TreeItemCollapsibleState.None;
					const tutUri : string | undefined = utils.getUriForDidactNameAndCategory(tutorial, category);
					const actualUri : vscode.Uri | undefined = getActualUri(tutUri);
					let timeLabel : string | undefined = undefined;
					if (actualUri) {
						const timeCount = await computeTimeForDidactFileUri(actualUri);
						if (timeCount > 0) {
							timeLabel = `(~${timeCount} mins)`;
							hasChildren = vscode.TreeItemCollapsibleState.Collapsed;
						}
					}
			
					const newNode = new TutorialNode(category, tutorial, tutUri, hasChildren, timeLabel);
					newNode.contextValue = 'TutorialNode';
					if (!this.doesNodeExist(children, newNode)) {
						this.addChild(newNode, true, children);
					}
				}
			}
		}
		return children;
	}

	getNodeFromADOCDiv(divElement : HTMLElement, tutUri: string | undefined, category : string | undefined) : HeadingNode | undefined {
		const classAttr : string | undefined = divElement.getAttribute("class");
		if (classAttr) {
			const splitArray : string[] = classAttr.split(' ');
			for (const chunk of splitArray) {
				if (chunk.startsWith('time=')) {
					const splitTime = chunk.split('=')[1];
					const timeValue = Number(splitTime);
					if (divElement.childNodes.length > 0) {
						const children = divElement.childNodes;
						for (const rawChild of children) {
							if (rawChild instanceof HTMLElement) {
								const child: HTMLElement = rawChild;
								if (child.tagName.startsWith('H')) {
									const title = rawChild.innerText;
									if (!Number.isNaN(timeValue)) {
										return new HeadingNode(category, title, tutUri, `(~${timeValue} mins)`);
									} else {
										sendTextToOutputChannel(`Warning: Heading node "${title}" has an invalid time value set to "${splitTime}"`)
									}
								}
							}
						}
					}
				}
			}
		}
		return undefined;
	}

	async processHeadingsForTutorial(tutUri: string | undefined, category : string | undefined) : Promise<HeadingNode[]> {
		const children : HeadingNode[] = [];
		const actualUri : vscode.Uri | undefined = getActualUri(tutUri);
		if (actualUri) {
			const headings : HTMLElement[] | undefined = await getTimeElementsForDidactFileUri(actualUri);
			if (headings && !isAsciiDoc(tutUri)) {
				for (const heading of headings) {
					const timeAttr = heading.getAttribute("time");

					let timeLabel = undefined;
					const timeValue = Number(timeAttr);
					if (!Number.isNaN(timeValue)) {
						timeLabel = `(~${timeValue} mins)`;
					}
					const title = heading.rawText;
					const newNode = new HeadingNode(category, title, tutUri, timeLabel);
					newNode.contextValue = 'HeadingNode';
					if (!this.doesNodeExist(children, newNode) && timeLabel) {
						this.addChild(newNode, true, children);
					}
					if (Number.isNaN(timeValue)) {
						sendTextToOutputChannel(`Warning: Heading node "${title}" has an invalid time value set to "${timeAttr}"`)
					}
				}
				return children;
			} else if (headings && isAsciiDoc(tutUri)){
				for (const heading of headings) {
					const newNode : HeadingNode | undefined = this.getNodeFromADOCDiv(heading, tutUri, category);
					if (newNode && !this.doesNodeExist(children, newNode)) {
						newNode.contextValue = 'HeadingNode';
						this.addChild(newNode, true, children);
					}
				}
				return children;
			}
		}
		return children;
	}

	findCategoryNode(category : string) : SimpleNode | null {
		const nodeToFind = new TreeNode(category, category, undefined, vscode.TreeItemCollapsibleState.Collapsed);
		return this.getCategory(this.treeNodes, nodeToFind);
	}
	
	async findTutorialNode(category : string, tutorialName : string ) : Promise<TutorialNode | undefined> {
		const catNode = this.findCategoryNode(category);
		if (catNode) {
			const treeItems : SimpleNode[] = await this.getChildren(catNode);
			let foundNode : TreeNode | undefined = undefined;
			treeItems.forEach(element => {
				if (element.label === tutorialName && element.category === category) {
					foundNode = element;
				}
			});
			return Promise.resolve(foundNode);
		}
		return Promise.resolve(undefined);
	}

	async findParentTutorialNode(category : string, uri: string) : Promise<SimpleNode | null> {
		const catNode = this.findCategoryNode(category);
		if (catNode) {
			const treeItems : SimpleNode[] = await this.getChildren(catNode);
			let foundNode : SimpleNode | null = null;
			for (const element of treeItems) {
				if (element.uri === uri && element.category === category) {
					foundNode = element;
					break;
				}
			}
			return Promise.resolve(foundNode);
		}
		return Promise.resolve(null);
	}
	
}

export class SimpleNode extends vscode.TreeItem {
	category: string | undefined;
	uri : string | undefined;
	constructor(
		type: string | undefined,
		label: string,
		uri: string | undefined,
	) {
		super(label, vscode.TreeItemCollapsibleState.None);
		this.uri = uri;
		this.category = type;
	}

	toString(): string {
		return `${this.category} ${this.label} ${this.uri}`;
	}	
}


// simple tree node for our tutorials view
export class TreeNode extends SimpleNode {
	uri : string | undefined;
	constructor(
		type: string | undefined,
		label: string,
		uri: string | undefined,
		collapsibleState: vscode.TreeItemCollapsibleState
	) {
		super(type, label, uri);
		this.collapsibleState = collapsibleState;
		this.uri = uri;
	}
}

export class TutorialNode extends TreeNode {
	constructor(
		category: string | undefined,
		label: string,
		uri: string | undefined,
		collapsibleState: vscode.TreeItemCollapsibleState,
		inTooltip? : string | undefined
	) {
		super(category, label, uri, collapsibleState);
		const localIconPath = vscode.Uri.file(path.resolve(getContext().extensionPath, 'icon/logo.svg'));
		this.iconPath = localIconPath;
		if (inTooltip) {
			this.description = inTooltip;
		}
	}
}

// simple heading node for an outline of the headings in our tutorial
export class HeadingNode extends SimpleNode {
	uri : string | undefined;
	constructor(
		category: string | undefined,
		label: string,
		uri: string | undefined,
		description : string | undefined
	) {
		super(category, label, uri);
		this.description = description;
	}
}

function retrieveTreeItemName(selection: SimpleNode) {
	const treeItemName: string | vscode.TreeItemLabel | undefined = selection.label;
	if (treeItemName === undefined) {
		return "";
	} else if(typeof treeItemName === "string") {
		return treeItemName;
	} else {
		return treeItemName.label;
	}
}
