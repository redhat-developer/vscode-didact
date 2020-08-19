import { DoublyLinkedList, DoublyLinkedListNode } from "./doublyLinkedList";
import { Uri } from 'vscode';

export class DidactHistory {
	private list = new DoublyLinkedList<string>();
	private current : DoublyLinkedListNode<string> | undefined;

	public add(uri : Uri) {
		if (!this.uriAlreadyExists(uri.toString())) {
			this.list.add(uri.toString());
			this.current = this.list.tail;
		}
	}

	public getCurrent() : DoublyLinkedListNode<string> | undefined {
		return this.current;
	}

	public getPrevious() : DoublyLinkedListNode<string> | undefined {
		let toReturn : DoublyLinkedListNode<string> | undefined = this.current?.prev;
		if (this.current === this.list.head) {
			toReturn = this.list.tail;
		}
		this.current = toReturn;
		return toReturn;
	}

	public getNext() : DoublyLinkedListNode<string> | undefined {
		let toReturn : DoublyLinkedListNode<string> | undefined = this.current?.next;
		if (this.current === this.list.tail) {
			toReturn = this.list.head;
		}
		this.current = toReturn;
		return toReturn;
	}

	public getList() : DoublyLinkedList<string> {
		return this.list;
	}

	private uriAlreadyExists(uri : string | undefined) : boolean | undefined{
		try {
			if (uri) {
				let vals = Array.from(this.getList().values());
				let index = vals.indexOf(uri);
				return index > -1;
			}
		} catch (error) {
			console.log(error);
		}
	}
}
