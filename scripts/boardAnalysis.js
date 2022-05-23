import {Queue} from "./state/aux_structures/queue.js";
import {statesEnum} from "./state/states.js";

/**
 * Functions which can calculate certain useful properties given a board state.
 */

/**
 * Minimum speed to win the game.
 * Speed is defined as (moves by player)/(rat move)
 * @param {Board} board - A board with ETA matrix set
 * @returns 
 */
function findMinSpeed(board) {
    let nRows = board.nRows;
    let nCols = board.nCols;

    let lo=1;
    let hi=nRows*nCols;
    while (lo < hi) {
        let mid = Math.floor((hi+lo)/2);
        if (isPossible(board, mid)) hi=mid;
        else lo=mid+1;
    }
    return lo;
}

/**
     * Runs a breadth-first search algorithm. Returns the length
     *  of the shortest path to each cell from the start cell
     * Looks at cells only - does not consider edges based on rat movement
     * 
     * @param {Board} board
     * @param {int} rows 
     * @param {int} columns 
     * @param {Object} start - {row : row, column : column}
     * @param {function} condition - Returns true if the cell can be traversed. condition(board, cell, bfsState)
     */
function bfsShortestPath(board, rows, columns, start, condition) {
    let queue = new Queue();
    
    let visited = [];
    let distances = [];

    for (let i=0;i<rows;i++) {
        visited.push([]);
        distances.push([]);
        for (let j=0;j<columns;j++) {
            visited[i].push(false);
            distances[i].push(Number.MAX_VALUE);
        }
    }

    queue.push(start);
    visited[start.row][start.column] = true;
    distances[start.row][start.column] = 0;
    
    while (!queue.isEmpty()) {
        let current = queue.pop();
        let neighbors = [
            {row : current.row, column : current.column-1}, 
            {row : current.row, column : current.column+1},
            {row : current.row-1, column : current.column},
            {row : current.row+1, column : current.column}
        ];
        for (let i=0;i<4;i++) {
            // Package state
            let bfsState = {visited : visited, distances : distances, next : queue, currentCell : current};
            if (!condition(board, neighbors[i], bfsState)) continue;
            if (visited[neighbors[i].row][neighbors[i].column]) continue;
            queue.push(neighbors[i]);
            visited[neighbors[i].row][neighbors[i].column] = true;
            distances[neighbors[i].row][neighbors[i].column] = distances[current.row][current.column] + 1;
        }
    }

    return distances;
}

/**
 * 
 * @param {Board} board 
 * @param {int} playerSpeed - player speed in player moves/rat movement
 */
function isPossible(board, playerSpeed) {
    let moveWeight = 1/playerSpeed;
    let etaMatrix = board.getETAMatrix();
    
    function isPossibleCanTraverse(board, cell, bfsState) {
        let cellState = board.getTileState(cell.row, cell.column);
        // It's a wall or rats reach too soon
        if (cellState==statesEnum.wall || 
            etaMatrix[cell.row][cell.column] <= moveWeight*(bfsState.distances[bfsState.currentCell.row][bfsState.currentCell.column]+1)) return false;
        return true;
    }
    let distances = bfsShortestPath(board, board.nRows, board.nCols, board.getPlayerPos(), isPossibleCanTraverse);
    for (let i=0;i<board.nRows;i++) {
        for (let j=0;j<board.nCols;j++) {
            if (board.getTileState(i,j)==statesEnum.target && distances[i][j] > board.nRows*board.nCols) return false;
        } 
    }
    return true;
}

export {findMinSpeed, bfsShortestPath};