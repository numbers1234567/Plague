
class QueueVertex {
    constructor(val) {
        this.val = val;
        this.next = undefined;
    }

    setNext(next) {
        this.next = next;
    }

    getNext() {
        return this.next;
    }
    
    getVal() {
        return this.val;
    }
}

/**
 * Implements the FIFO queue in JavaScript
 * This is one reason I don't like JavaScript
 * 
 * Uses the standard methods for queue, push and pop.
 */
class Queue {
    constructor() {
        this.head = undefined;
        this.tail = undefined;
    }

    pop() {
        if (this.tail===undefined) return undefined;
        let ret = this.tail.getVal();
        this.tail=this.tail.getNext();

        if (this.tail===undefined) {
            // Empty queue, must explicitly set head as undefined
            this.head = undefined;
        }
        return ret;
    }

    push(val) {
        if (this.head===undefined) {
            this.head = new QueueVertex(val);
            this.tail = this.head;
        }
        else {
            let newHead = new QueueVertex(val);

            this.head.setNext(newHead);
            this.head = this.head.getNext();
        }
    }

    isEmpty() {
        return this.head===undefined;
    }
}

export {Queue};