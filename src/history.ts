import { DoublyLinkedList, DoublyLinkedListNode } from "./doublyLinkedList";
import { Uri } from 'vscode';

export class DidactHistory {
	private list = new DoublyLinkedList<Uri>();
	private current : DoublyLinkedListNode<Uri> | undefined;

	public add(uri : Uri) {
		if (!this.uriAlreadyExists(uri)) {
			this.list.add(uri);
			this.current = this.list.tail;
		}
	}

	public getCurrent() : DoublyLinkedListNode<Uri> | undefined {
		console.log(`Current: ${this.current?.value}`);
		return this.current;
	}

	public getPrevious() : DoublyLinkedListNode<Uri> | undefined {
		const toReturn : DoublyLinkedListNode<Uri> | undefined = this.current?.prev;
		this.current = toReturn;
		return toReturn;
	}

	public getNext() : DoublyLinkedListNode<Uri> | undefined {
		const toReturn : DoublyLinkedListNode<Uri> | undefined = this.current?.next;
		this.current = toReturn;
		return toReturn;
	}

	public getList() : DoublyLinkedList<Uri> {
		return this.list;
	}

	private uriAlreadyExists(uri : Uri | undefined) : boolean | undefined{
		try {
			if (uri) {
				return Array.from(this.list.values()).includes(uri);
			}
		} catch (error) {
			console.log(error);
		}
	}
}
