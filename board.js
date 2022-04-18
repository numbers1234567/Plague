class Tile {
    constructor(state, row, column) {
        if (this.constructor==Tile) {
            throw new Error("Cannot instantiate abstract class.");
        }
        this.state = state;
        this.row=row;
        this.column=column;
        this.edges = [];
    }

    /**
     * 
     * @param {int} otherRow 
     * @param {int} otherColumn 
     */
    addEdge(otherRow, otherColumn) {
        this.edges.add({row : otherRow, column : otherColumn});
    }

    /**
     * Must be overwritten by child classes
     * @param {int} newState - new state of this tile. State meaning is defined by subclasses.
     */
    updateState(newState) {
        throw new Error("Must overwrite abstract method updateState of class Tile.");
    }

    /**
     * 
     * @returns the current state of the tile, however this is defined.
     */
    getState() {
        return this.state;
    }

    /**
     * 
     * @returns position of the tile, of form {row : int, column : int}.
     */
    getPosition() {
        return {row : this.row, column : this.column};
    }

    /**
     * 
     * @returns An array of all the out edges of the tile. Typically this would be neighbor tiles.
     */
    getOutEdges() {
        edgesDeepCopy = [];
        for (let i=0;i<this.edges.length;i++) {
            edgesDeepCopy.push({row : this.edges[i].row, column : this.edges[i].column});
        }
        return edgesDeepCopy;
    }
}

class Board {
    
    constructor() {
        if (this.constructor==Board) {
            throw new Error("Cannot instantiate abstract class.");
        }
        // No idea how tiles are structured.
        this.tiles = []; 
    }
    
    /**
     * 
     * @param {int} row 
     * @param {int} column 
     * @returns the state of the tile with row row and column column.
     */
    getTileState(row, column) {
        return this.tiles[row][column].getState();
    }
    

    /**
     * Calculates and sets the estimated time of arrival for every tile from the given start tiles.
     * @param {Array} starts - An array of objects, each of form {row : row, column : column} indicating from which tiles to start the ETA calculations from.
     */
    calcETAMatrix(starts) {
        throw new Error("Must overwrite abstract method calcETAMatrix of class Board.");
    }
    
    /**
     * 
     * @returns an Object, which contains all the data of the board in some form
     */
    saveState() {
        throw new Error("Must overwrite abstract method saveState of class Board.");
    }
}