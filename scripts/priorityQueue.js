

class PriorityQueue {
    constructor(comparator=undefined) { 
        this.heap = [];
        this.comparator=comparator;
        if (comparator===undefined) { // negative if a has higher priority
            this.comparator = ((a, b) => a-b);
        }
    }

    push(element) {
        this.heap.push(element);
        this.percolateUp(this.heap.length-1);
    }

    percolateUp(i) {
        let parent = Math.floor((i-1)/2);
        if (i>0 && this.comparator(this.heap[i], this.heap[parent]) < 0) {
            
            let buf = this.heap[parent];
            this.heap[parent] = this.heap[i];
            this.heap[i] = buf;
            this.percolateUp(parent);
        }
    }

    pop() {
        if (this.heap.length<=1) return this.heap.pop();
        let ret = this.heap[0];
        this.heap[0] = this.heap.pop();
        
        this.percolateDown(0);
        return ret;
    }

    percolateDown(i) {
        let c1 = 2*i+1;
        let c2 = 2*i+2;
        let toSwap = c2;
        if (c2 < this.heap.length) {
            if (this.comparator(this.heap[i], this.heap[c1]) < 0 && this.comparator(this.heap[i], this.heap[c2]) < 0) return;
            toSwap = c2;
            if (this.comparator(this.heap[c1], this.heap[c2]) < 0) toSwap = c1;
        }
        else if (c2==this.heap.length) {
            if (this.comparator(this.heap[i], this.heap[c1]) < 0) return;
            toSwap = c1;
        }
        else return;
        //console.log("wtf " + i);
        let buf = this.heap[i];
        this.heap[i] = this.heap[toSwap];
        this.heap[toSwap] = buf;
        this.percolateDown(toSwap);
    }

    isEmpty() {
        return this.heap.length==0;
    }
}

export {PriorityQueue};