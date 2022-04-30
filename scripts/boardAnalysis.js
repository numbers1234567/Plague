import {Queue} from "./queue.js";
import {statesEnum} from "./states.js";

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
        console.log(isPossible(board, mid));
        if (isPossible(board, mid)) hi=mid;
        else lo=mid+1;
    }
    return lo;
}

/**
 * 
 * @param {Board} board 
 * @param {int} playerSpeed - player speed in player moves/rat movement
 */
function isPossible(board, playerSpeed) {
    let moveWeight = 1/playerSpeed;
    let etaMatrix = board.getETAMatrix();
    // Breadth-first search
    let dist=[];
    let visited=[];
    for (let i=0;i<board.nRows;i++) {
        dist.push([]);
        visited.push([]);
        for (let j=0;j<board.nCols;j++) {
            dist[i].push(Number.MAX_SAFE_INTEGER);
            visited[i].push(false);
        }
    }
    let start = board.getPlayerPos();
    dist[start.row][start.column] = 0;
    let q = new Queue();
    q.push({row : start.row, column : start.column});
    visited[start.row][start.column] = true;
    while (!q.isEmpty()) {
        let current = q.pop();
        let neighbors=[
            {row : current.row+1, column : current.column},
            {row : current.row-1, column : current.column},
            {row : current.row, column : current.column+1},
            {row : current.row, column : current.column-1}
        ]
        for (let i=0;i<4;i++) {
            let neighbor = neighbors[i]
            if (visited[neighbor.row][neighbor.column]) continue;
            let neighborState = board.getTileState(neighbor.row, neighbor.column)
            // It's a wall or rats reach too soon
            if (neighborState==statesEnum.wall || 
                etaMatrix[neighbor.row][neighbor.column] <= dist[current.row][current.column]+moveWeight) continue;
            q.push(neighbor);
            visited[neighbor.row][neighbor.column] = true;
            dist[neighbor.row][neighbor.column] = dist[current.row][current.column] + moveWeight;
        }
    }
    let targetPos = undefined;
    for (let i=0;i<board.nRows;i++) {
        for (let j=0;j<board.nCols;j++) {
            if (board.getTileState(i,j)==statesEnum.target) return visited[i][j];
        } 
    }
}

export {findMinSpeed};