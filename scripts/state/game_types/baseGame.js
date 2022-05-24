import { Board, Tile } from "../boardTemplate.js";
import {statesEnum} from "../states.js";
import {Queue} from "../aux_structures/queue.js";
import { disjointSet } from "../aux_structures/disjointSet.js";
import { PriorityQueue } from "../aux_structures/priorityQueue.js";
import { bfsShortestPath } from "../../boardAnalysis.js";

function compareDistances(a, b) {
    return a.distance-b.distance
};

/**
 * Shuffles the given array randomly
 * @param {list} arr - an array of objects to shuffle
 */
function shuffleArray(arr) {
    for (let i = arr.length-1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
}

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
    constructor(rows, columns, initialState=undefined, numHoles=undefined, numPaths=undefined, bias=undefined, deadEnds=false) {
        super(rows, columns);
        // Holes from which rats can leave
        this.holes = [];
        this.playerPos = undefined;
        this.playerAbove = statesEnum.empty; // Tile type the player is currently on
        this.lost = false;
        this.steps = 0;
        if (initialState===undefined) {
            this.initRandom(rows, columns, numHoles, numPaths, bias, deadEnds);
        }
        else {
            if (numHoles!==undefined || numPaths!==undefined) {
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
    initRandom(rows, columns, numHoles=undefined, numPaths=undefined, bias=undefined, deadEnds=false) {
        // Arbitrary default settings
        if (numHoles===undefined) numHoles = rows*columns/80;
        if (numPaths===undefined) numPaths = 12;

        let start = {row : 1, column : 1};
        let end = {row : rows-2, column : columns-2};

        this.playerPos = start;

        this.numTarget = 1;

        this.fillBlocks();
        
        this.generateMultipathMaze(rows, columns, numPaths, start, end, bias);
        this.chooseRandomHoles(rows, columns, numHoles);
        this.setMinSpanningTreeHoles();
        if (!deadEnds) this.removeDeadEnds();
        this.calcETAMatrix([{row : 1, column : columns-2}, {row : rows-2, column : 1}]);
    }
    
    fillBlocks() {
        // Initial state - complete solid
        for (let i=0;i<this.nRows;i++) {
            for (let j=0;j<this.nCols;j++) {
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
     * Modify this.tiles to remove dead-ends
     */
    removeDeadEnds() {
        for (let i=1;i<this.nRows;i+=2) {
            for (let j=1;j<this.nCols;j+=2) {
                let neighbors = [
                    {row : i+2, column: j},
                    {row : i-2, column: j},
                    {row : i, column: j+2},
                    {row : i, column: j-2}
                ];
                
                let candidateWalls = [];
                let numWalls = 0;
                for (let k=0;k<4;k++) {
                    let neighbor = neighbors[k];
                    let inbetween = {row : (i+neighbor.row)/2,
                                    column : (j+neighbor.column)/2};
                    if (this.getTileState(inbetween.row, inbetween.column)==statesEnum.wall) numWalls++;
                    // Border wall
                    if ((neighbor.row < 0 || neighbor.row >= this.nRows) ||
                    (neighbor.column < 0 || neighbor.column >= this.nCols)) continue;

                    if (this.getTileState(inbetween.row, inbetween.column)==statesEnum.wall) candidateWalls.push(inbetween);
                }
                if (numWalls<3) continue;
                let chosen = candidateWalls[Math.floor(Math.random()*candidateWalls.length)];
                this.tiles[chosen.row][chosen.column].updateState(statesEnum.empty);
            }
        }
    }

    /**
     * Sets up a random maze as the board. Modifies this.state.
     * This should be the only thing affecting walls.
     * 
     * @param {int} rows 
     * @param {int} columns 
     * @param {int} numPaths - number of unique paths from start to end
     * @param {Object} start - of form {row : row, column : column}, the start of the maze
     * @param {Object} end - of form {row : row, column : column}, the target of the maze
     * 
     * Note: start.row==end.row==start.column==end.column==1 (mod 2).
     */
    generateMultipathMaze(rows, columns, numPaths, start, end, bias) {
        this.generateDfsSinglePathMaze(rows, columns, start, end, bias);
        
        function canTraverse(board, cell, bfsState) {
            if (board.getTileState(cell.row, cell.column)==statesEnum.wall) return false;
            if (cell.row <= 0 || cell.row >= rows-1) return false;
            if (cell.column <= 0 || cell.column >= columns-1) return false;
            return true;
        }
        let startDistances = bfsShortestPath(this, rows, columns, start, canTraverse);
        let targetDistances = bfsShortestPath(this, rows, columns, end, canTraverse);
        
        // Walls to break
        let candidateWalls = []; 
        for (let i=1; i<rows-2;i+=2) {
            for (let j=1; j<columns-2;j+=2) {
                let neighbors = [{row : i+2, column : j}, {row : i, column : j+2}];
                for (let k=0;k<2;k++) {
                    let neighbor = neighbors[k];
                    // Both neighbor and (i, j) are either close to start or close to target. Invalid
                    if (startDistances[i][j] < targetDistances[i][j] && 
                        startDistances[neighbor.row][neighbor.column] < targetDistances[neighbor.row][neighbor.column]) continue;    
                    if (startDistances[i][j] > targetDistances[i][j] && 
                        startDistances[neighbor.row][neighbor.column] > targetDistances[neighbor.row][neighbor.column]) continue;
                    
                    let between = {row : (i+neighbor.row)/2, column : (j+neighbor.column)/2}
                    
                    if (this.getTileState(between.row, between.column) != statesEnum.wall) continue; 
                    
                    candidateWalls.push(between);
                }
            }
        }
        
        shuffleArray(candidateWalls);
        for (let i=0;i<candidateWalls.length && i<numPaths-1;i++) {
            let cell = candidateWalls[i];
            // Break wall
            this.tiles[cell.row][cell.column].updateState(statesEnum.empty);
        }
    }
    
    /**
     * Uses a randomized depth-first search to generate a maze. 
     * 
     * Has a similar parameter setup as generateMultipathMaze
     * @param {int} rows 
     * @param {int} columns 
     * @param {int} start 
     * @param {int} end 
     */
    generateDfsSinglePathMaze(rows, columns, start, end, bias) {
        this.tiles[start.row][start.column].updateState(statesEnum.player);
        this.tiles[end.row][end.column].updateState(statesEnum.target);
        
        
        // Random dfs maze generation
        let visited = [];
        for (let i=0;i<rows;i++) {
            visited.push([]);
            for (let j=0;j<columns;j++) {
                visited[i].push(false);
            }
        }
        
        let stack = [{row : start.row, column : start.column}]
        visited[start.row][start.column] = true;
        while (stack.length > 0) {
            let current = stack.pop();
            
            // Separation for horizontal/vertical bias
            let neighbors = [
                [{row : current.row, column : current.column-2}, 
                {row : current.row, column : current.column+2}],
                [{row : current.row-2, column : current.column},
                {row : current.row+2, column : current.column}]
            ];

            let candidateNeighbors = [[],[]];
            let pushBack = false;
            
            for (let i=0;i<4;i++) {
                let neighbor = neighbors[Math.floor(i/2)][i%2];
                if (neighbor.row <= 0 || neighbor.row >= rows-1) continue;
                if (neighbor.column <= 0 || neighbor.column >= columns-1) continue;
                if (visited[neighbor.row][neighbor.column]) continue;
                
                // Keep current in stack.
                if (!pushBack) {
                    pushBack = true;
                    stack.push(current);
                }
                candidateNeighbors[Math.floor(i/2)].push(neighbor);
            }
            
            if (pushBack) {
                // Choose horizontal or vertical
                // Ensure uniform distribution
                
                let randomMax = bias*candidateNeighbors[0].length+(1-bias)*candidateNeighbors[1].length;
                if ((Math.random()*randomMax < bias*candidateNeighbors[0].length) || candidateNeighbors[1].length==0) 
                    candidateNeighbors = candidateNeighbors[0];
                else 
                    candidateNeighbors = candidateNeighbors[1];
                let chosen = candidateNeighbors[Math.floor(Math.random()*candidateNeighbors.length)];

                stack.push(chosen);
                visited[chosen.row][chosen.column] = true;
                // Break wall
                this.tiles[(chosen.row+current.row)/2][(chosen.column+current.column)/2].updateState(statesEnum.empty);
                

               /*let flatten = [];
               for (let i=0;i<candidateNeighbors.length;i++) {
                   for (let j=0;j<candidateNeighbors[i].length;j++) {
                       flatten.push(candidateNeighbors[i][j]);
                    }
                }
                shuffleArray(flatten);
                let chosen = flatten[0];
                
                stack.push(chosen);
                visited[chosen.row][chosen.column] = true;
                this.tiles[(chosen.row+current.row)/2][(chosen.column+current.column)/2].updateState(statesEnum.empty);
                */
            }
        }
        
    }

    /**
     * Sets random holes on the board
     */
    chooseRandomHoles(rows, columns, numHoles) {
        let holesChoice = [];
        for (let i=1;i<rows;i+=2) {
            for (let j=1;j<columns;j+=2) {
                if (this.tiles[i][j].getState() != statesEnum.empty) continue;
                holesChoice.push({row : i, column : j});
            }
        }

        shuffleArray(holesChoice);

        for (let i=0;i<numHoles;i++) {
            let cell = holesChoice[i];
            this.tiles[cell.row][cell.column].updateState(statesEnum.hole);
            this.holes.push(cell);
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
        // Dijkstra's algorithm
        let dist = [];
        let visited = [];

        let rows = this.tiles.length;
        let columns = this.tiles[0].length;

        for (let i=0;i<rows;i++) {
            dist.push([]);
            visited.push([]);
            for (let j=0;j<columns;j++) {
                dist[i].push(Number.MAX_SAFE_INTEGER);
                visited[i].push(false);
            }
        }
        let pq = new PriorityQueue(compareDistances);

        for (let i=0;i<starts.length;i++) {
            dist[starts[i].row][starts[i].column] = 0;
            this.tiles[starts[i].row][starts[i].column].updateState(statesEnum.rat);
        }
        
        for (let i=0;i<rows;i++) {
            for (let j=0;j<columns;j++) {
                if (this.tiles[i][j].getState() == statesEnum.wall) continue;
                pq.push({row : i, column : j, distance : dist[i][j]});
            }
        }

        while (!pq.isEmpty()) {
            let current = pq.pop();
            
            if (dist[current.row][current.column] < current.distance) continue;
            
            visited[current] = true;
            let neighbors = this.tiles[current.row][current.column].getOutEdges();
            for (let i=0;i<neighbors.length;i++) {
                let neighbor = neighbors[i];
                if (visited[neighbor.row][neighbor.column] ||
                    this.tiles[neighbor.row][neighbor.column].getState()==statesEnum.wall) continue;

                let dx = current.column - neighbor.column;
                let dy = current.row - neighbor.row;
                let newDistance = current.distance + Math.round(Math.sqrt(dx*dx+dy*dy));

                if (newDistance < dist[neighbor.row][neighbor.column]) {
                    dist[neighbor.row][neighbor.column] = newDistance;
                    pq.push({row : neighbor.row, column : neighbor.column, distance : newDistance});
                }
            }
        }

        this.etaMatrix = dist;
    }
    
    /**
     * Sets tile edges on minimum spanning tree on holes based on euclidean distance.
     */ 
    setMinSpanningTreeHoles() {
        let edges = [];
        for (let i=0;i<this.holes.length;i++) {
            for (let j=0;j<i;j++) {
                if (i==j) continue;
                let dy = this.holes[i].row - this.holes[j].row;
                let dx = this.holes[i].column - this.holes[j].column;
                edges.push({from : i, to : j, distance : Math.round(Math.sqrt(dx*dx+dy*dy))});
            }
        }
        
        // kruskal's
        let dsu = new disjointSet(this.holes.length);
        
        edges.sort((a, b) => (a.distance-b.distance));
        for (let i=0;i<edges.length;i++) {
            let edge = edges[i];
            if (dsu.find(edge.from)==dsu.find(edge.to)) continue;
            dsu.union(edge.from, edge.to);

            let from = this.holes[edge.from];
            let to = this.holes[edge.to]
            this.tiles[from.row][from.column].addEdge(to);
            this.tiles[to.row][to.column].addEdge(from);
        }
    }

    /**
     * Deep copies this.etaMatrix.
     * @returns an 2d integer array, containing how much time before rats arrive at (i,j)
     * 
     */
    getETAMatrix() {
        let etaCopy = [];
        for (let i=0;i<this.etaMatrix.length;i++) {
            etaCopy.push([]);
            for (let j=0;j<this.etaMatrix[i].length;j++) {
                etaCopy[i].push(this.etaMatrix[i][j]);
            }
        }
        return etaCopy;
    }

    getPlayerPos() {
        return {row : this.playerPos.row, column : this.playerPos.column};
    }

    movePlayer(offset) {
        let pos = this.getPlayerPos();
        let newPos = {row : offset.row + pos.row,
                      column : offset.column + pos.column};
        if (this.tiles[newPos.row][newPos.column].getState() == statesEnum.wall) return this.playerPos;

        // Reset the previous player position and update the new player position.
        this.tiles[pos.row][pos.column].updateState(this.playerAbove);
        this.playerAbove = this.tiles[newPos.row][newPos.column].getState();
        this.tiles[newPos.row][newPos.column].updateState(statesEnum.player);
        this.playerPos = newPos;

        // 1 less target
        if (this.playerAbove==statesEnum.target) {
            this.numTarget--;
            this.playerAbove=statesEnum.empty;
        }
        if (this.etaMatrix[newPos.row][newPos.column] <= this.steps) this.lost = true;
    }

    saveState() {

    }

    updateState() {
        this.steps++;
        for (let i=0;i<this.tiles.length;i++) {
            for (let j=0;j<this.tiles[i].length;j++) {
                if (this.etaMatrix[i][j] <= this.steps) {
                    this.tiles[i][j].updateState(statesEnum.rat);
                }
            }
        }
    }

    stateWon() {
        return this.numTarget==0;
    }

    stateLost() {
        return this.lost;
    }
}

export {BaseGameBoard};