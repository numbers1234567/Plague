import { Board, Tile } from "../boardTemplate.js";
import {statesEnum} from "../states.js"

class BaseGameTile extends Tile {
    constructor(state, row, column) {
        super(state, row, column);
        this.edges.push(
            {row : row-1, column : column}, 
            {row : row+1, column : column}, 
            {row : row, column : column-1}, 
            {row : row, column : column+1}
        );
    }

    updateState(newState) {
        this.state=newState;
    }

    addEdge(to) {
        this.edges.push(to);
    }
}

/**
 * Define the base game.
 */
class BaseGameBoard extends Board {
    constructor(rows, columns, initialState=undefined, numHoles=undefined, numEdges=undefined, numPaths=undefined) {
        super(rows, columns);
        if (initialState===undefined) {
            this.initRandom(rows, columns, numHoles=numHoles, numEdges=numEdges, numPaths=numPaths);
        }
        else {
            if (numHoles!==undefined || (numEdges!==undefined || numPaths!==undefined)) {
                throw new Error("Invalid inputs. Initial state is defined, but given extra parameters");
            }
        }
    }
    
    /**
     * 
     * @param {int} rows 
     * @param {int} columns 
     * @param {int} numHoles - How many holes rats come from
     * @param {int} numEdges - How many edges between holes
     */
    initRandom(rows, columns, numHoles=undefined, numEdges=undefined, numPaths=undefined) {
        // Arbitrary default settings
        if (numHoles===undefined) numHoles = rows*columns/20;
        if (numEdges===undefined) numEdges = numHoles*3;
        if (numPaths===undefined) numPaths = 3;

        // Generate start and target for player
        let start = {row : Math.floor(Math.floor(Math.random()*(rows-1))/2)+1,
                 column : Math.floor(Math.floor(Math.random()*(columns-1))/2)+1};
        let end = {}
        do { // Until we are not getting end==start. Might define a different criteria later.
            end = {row : Math.floor(Math.floor(Math.random()*(rows-1))/2)+1,
                 column : Math.floor(Math.floor(Math.random()*(columns-1))/2)+1};
        } while (end.row==start.row && end.column==start.column);

        // Generate maze for player
        this.generateMultipathMazeBoard(rows, columns, numPaths, start, end);
    }

    /**
     * Sets up a random maze as the board. Modifies this.state.
     * This should be the only thing affecting walls.
     * 
     * First generate a single-path maze, then removes walls in a specific way to 
     *  create new paths.
     * @param {int} rows 
     * @param {int} columns 
     * @param {int} numPaths - number of unique paths from start to end
     * @param {Object} start - of form {row : row, column : column}, the start of the maze
     * @param {Object} end - of form {row : row, column : column}, the target of the maze
     * 
     * Note: start.row==end.row==start.column==end.column==1 (mod 2).
     */
    generateMultipathMazeBoard(rows, columns, numPaths, start, end) {
        // Fill with solid blocks
        for (let i=0;i<rows;i++) {
            for (let j=0;j<columns;j++) {
                if (i%2==1 && j%2==1) {
                    this.tiles[i][j] = new BaseGameTile(statesEnum.empty, i, j);
                }
                else {
                    this.tiles[i][j] = new BaseGameTile(statesEnum.wall, i, j);
                }
            }
        }
    }

    /**
     * Copies initialState into the board.
     * @param {?} initialState - Initial state, in the format returned by saveState
     */
    initState(initialState) {
        // Bruh
    }

    /**
     * Sets the ETA matrix for rats starting at positions given by starts.
     *  For each tile (i,j), this.etaMatrix[i][j] is the exact time of arrival of the rats
     * @param {Array} starts - An array of objects of form {row : row, column : column}
     */
    calcETAMatrix(starts) {

    }

    /**
     * Deep copies this.etaMatrix.
     * @returns an 2d integer array, containing how much time before rats arrive at (i,j)
     * 
     */
    getETAMatrix() {
        etaCopy = [];
        for (let i=0;i<this.etaMatrix.length;i++) {
            etaCopy.push([]);
            for (let j=0;j<this.etaMatrix[i].length;j++) {
                etaCopy[i].push(this.etaMatrix[i][j]);
            }
        }
        return etaCopy;
    }

    saveState() {

    }

    updateState() {

    }

}

export {BaseGameBoard};