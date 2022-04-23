/**
 * 
 * Some base definitions for the map which are required for the game to even work.
 *
 */

class Tile {
    /**
     * 
     * @param {int} state - representing the current state of the tile. Used for display and calculation purposes
     * @param {int} row - representing which row the tile is
     * @param {int} column - representing which column the tile is
     */
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
        let edgesDeepCopy = [];
        for (let i=0;i<this.edges.length;i++) {
            edgesDeepCopy.push({row : this.edges[i].row, column : this.edges[i].column});
        }
        return edgesDeepCopy;
    }
}

class Board {
    
    /**
     * Initializes the Board. Subclasses must define this.tiles as well as call
     *  calcETAMatrix to initialize this.etaMatrix. Walls occupy entire tiles.
     * @param {int} rows - number of rows in board 
     * @param {*} columns - number of columns in board
     * 
     * Note: rows==columns==1 (mod 2).
     */
    constructor(rows, columns) {
        if (this.constructor==Board) {
            throw new Error("Cannot instantiate abstract class.");
        }
        this.nRows = rows;
        this.nCols = columns;
        // No idea how tiles are structured. Must extend the Tile class.
        this.tiles = []; 

        this.etaMatrix = [];
        for (let i=0;i<rows;i++) {
            this.tiles.push([]);
            this.etaMatrix.push([]);
            for (let j=0;j<columns;j++) this.tiles[i].push(undefined);
            for (let j=0;j<columns;j++) this.etaMatrix[i].push(-1);
        }
    }
    
    /**
     * 
     * @param {int} row 
     * @param {int} column 
     * @returns an integer, the state of the tile with row row and column column.
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
     * @returns an 2d integer array, containing how many steps must be taken for rats to reach each tile.
     */
    getETAMatrix() {
        throw new Error("Must overwrite abstract method calcETAMatrix of class Board.");
    }
    
    /**
     * 
     * @returns an Object, which contains all the data of the board in some form
     */
    saveState() {
        throw new Error("Must overwrite abstract method saveState of class Board.");
    }
    
    /**
     * Performs a single update step for the given state.
     * This should be where all the main logic is.
     */
    updateState() {
        throw new Error("Must overwrite abstract method updateState of class Board.");
    }
    
    /**
     * @returns the current position of the player
     */
    getPlayerPos() {
        throw new Error("Must overwrite abstract method getPlayerPos of class Board.");
    }
    
    /**
     * Offsets the player in the board representation.
     * 
     * @param {Object} offset - of form {row : row offset, column : column offset}.
     * @returns the new player position.
     */
    movePlayer(offset) {
        throw new Error("Must overwrite abstract method movePlayer of class Board.");
    }
}

export {Tile, Board};