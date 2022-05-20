

class disjointSet {
    constructor(length) {
        this.arr = [];
        for (let i=0;i<length;i++) {
            this.arr.push(i);
        }
    }

    union(i, j) {
        let rootI = this.find(i);
        let rootJ = this.find(j);
        if (rootI==rootJ) {
            return;
        }
        this.arr[rootI] = rootJ;
    }
    find(i) {
        if (this.arr[i]==i) return i;
        else {
            let root = this.find(this.arr[i]);
            this.arr[i] = root;
            return root;
        }
    }
}

export {disjointSet};