import { bfsShortestPath, findMinSpeed } from "../../boardAnalysis.js";
import { statesEnum } from "../states.js";
import { BaseGameBoard } from "./baseGame.js";

/**
 * This is a version which guarantees the shortest path (without rats) 
 *  is not the correct path
 */
class TrickyGameBoard extends BaseGameBoard {
    constructor(rows, columns, numHoles=undefined, numPaths=undefined, bias=undefined) {
        super(rows, columns, undefined, numHoles, numPaths, bias);
        while (!this.isTricky()) this.initRandom(rows, columns, numHoles, numPaths, bias);
    }

    /**
     * Determines if the board is tricky. 
     * Should always return true once the board is confirmed.
     */
    isTricky() {
        let rows = this.nRows;
        let columns = this.nCols;
        // Shortest path without rats
        function canTraverse(board, cell, bfsState) {
            if (board.getTileState(cell.row, cell.column)==statesEnum.wall) return false;
            if (cell.row <= 0 || cell.row >= rows-1) return false;
            if (cell.column <= 0 || cell.column >= columns-1) return false;
            return true;
        }
        let shortestMinusRats = bfsShortestPath(this, this.nRows, this.nCols, this.playerPos, canTraverse);
        
        // Shortest path with rats (determine minimum speed first)
        let playerSpeed = findMinSpeed(this);
        function canTraverseRats(board, cell, bfsState) {
            if (!canTraverse(board, cell, bfsState)) return false;
            if ((bfsState.distances[bfsState.currentCell.row][bfsState.currentCell.column]+1)/playerSpeed >= board.etaMatrix[cell.row][cell.column]) return false;
            return true;
        }
        let shortestWithRats = bfsShortestPath(this, this.nRows, this.nCols, this.playerPos, canTraverseRats);
        let targetPos;
        for (let i=0;i<this.nRows;i++) {
            for (let j=0;j<this.nCols;j++) {
                if (this.getTileState(i, j) == statesEnum.target) 
                    targetPos = {row : i, column : j};
                
            }
        }
        
        return shortestMinusRats[targetPos.row][targetPos.column] != shortestWithRats[targetPos.row][targetPos.column];
    }
}

export { TrickyGameBoard };