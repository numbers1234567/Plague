import { Board, Tile } from "../boardTemplate.js";
import {statesEnum} from "../states.js";
import {Queue} from "../queue.js";

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
    constructor(rows, columns, initialState=undefined, numHoles=undefined, numEdges=undefined, numPaths=undefined) {
        super(rows, columns);
        // Holes from which rats can leave
        this.holes = [];
        this.playerPos = undefined;
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
        if (numHoles===undefined) numHoles = rows*columns/80;
        if (numEdges===undefined) numEdges = numHoles*3;
        if (numPaths===undefined) numPaths = 6;

        // Generate start and target for player
        let start = {row : 1, column : 1};
        let end = {row : rows-2, column : columns-2};

        this.playerPos = start;

        // Generate maze for player
        this.generateMultipathMaze(rows, columns, numPaths, start, end);

        // Set holes for rats.
        this.chooseRandomHoles(rows, columns, numHoles);
    }

    /**
     * Runs a breadth-first search algorithm. Returns the ETA to each 
     *  cell from the start cell
     * 
     * @param {int} rows 
     * @param {int} columns 
     * @param {Object} start - {row : row, column : column}
     */
    bfsShortestPath(rows, columns, start) {
        let queue = new Queue();
        
        let visited = [];
        // Distance of each tile from start
        let distances = [];

        // Initialize arrays. Why can't JavaScript just have normal arrays?!?!?!?!?
        for (let i=0;i<rows;i++) {
            visited.push([]);
            distances.push([]);
            for (let j=0;j<columns;j++) {
                visited[i].push(false);
                distances[i].push(Number.MAX_VALUE);
            }
        }

        // Initial state
        queue.push(start);
        visited[start.row][start.column] = true;
        distances[start.row][start.column] = 0;
        
        // Determine distances from start
        while (!queue.isEmpty()) {
            let current = queue.pop();
            // Holds also invalid neighbors
            let neighbors = this.tiles[current.row][current.column].getOutEdges();
            for (let i=0;i<4;i++) {
                // Invalid neighbor
                if (this.getTileState(neighbors[i].row, neighbors[i].column)==statesEnum.wall) continue;
                if (neighbors[i].row <= 0 || neighbors[i].row >= rows-1) continue;
                if (neighbors[i].column <= 0 || neighbors[i].column >= columns-1) continue;
                if (visited[neighbors[i].row][neighbors[i].column]) continue;
                queue.push(neighbors[i]);
                visited[neighbors[i].row][neighbors[i].column] = true;
                distances[neighbors[i].row][neighbors[i].column] = distances[current.row][current.column] + 1;
            }
        }

        return distances;
    }

    /**
     * Sets up a random maze as the board. Modifies this.state.
     * This should be the only thing affecting walls.
     * 
     * First generate a single-path maze, then removes walls in a specific way to 
     *  create new paths. It removes walls if the wall is between a cell closer to 
     *  the start and another cell closer to the target.
     * 
     * @param {int} rows 
     * @param {int} columns 
     * @param {int} numPaths - number of unique paths from start to end
     * @param {Object} start - of form {row : row, column : column}, the start of the maze
     * @param {Object} end - of form {row : row, column : column}, the target of the maze
     * 
     * Note: start.row==end.row==start.column==end.column==1 (mod 2).
     */
    generateMultipathMaze(rows, columns, numPaths, start, end) {
        // First generate one with a single path
        this.generateDfsSinglePathMaze(rows, columns, start, end);
        
        let startDistances = this.bfsShortestPath(rows, columns, start);
        let targetDistances = this.bfsShortestPath(rows, columns, end);
        
        // Determine which walls to break to create new paths
        let candidateWalls = []; // List of walls to potentially break
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
                            
                    // Neighbor and (i, j) are in different sets
                    let between = {row : (i+neighbor.row)/2, column : (j+neighbor.column)/2}
                    // But no wall :/
                    if (this.getTileState(between.row, between.column) != statesEnum.wall) continue; 
                    
                    candidateWalls.push(between);
                }
            }
        }
        // I kind of want to remove dead-ends, to make it more confusing and difficult for a player
        /*for (let i=1; i<rows-2;i+=2) {
            for (let j=1; j<columns-2;j+=2) {
                let directNeighbors = this.tiles[i][j].getOutEdges();
                let numWalls = 0;
                for (let k=0;k<directNeighbors.length;k++) {
                    if (this.tiles[directNeighbors[k].row][directNeighbors[k].column].getState() == statesEnum.wall) numWalls++;
                }
        
                if (numWalls!=3) continue;  // Dead end.
                // Holds also invalid neighbors
                let neighbors = [
                    {row : current.row, column : current.column-2},
                    {row : current.row, column : current.column+2},
                    {row : current.row-2, column : current.column},
                    {row : current.row+2, column : current.column}
                ];
                let newNeighbors = [];
                
            }
        }*/
        // Choose walls to break
        shuffleArray(candidateWalls);
        for (let i=0;i<candidateWalls.length && i<numPaths-1;i++) {
            let cell = candidateWalls[i];
            // Break
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
    generateDfsSinglePathMaze(rows, columns, start, end) {
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
        
        // Set start and end
        this.tiles[start.row][start.column].updateState(statesEnum.player);
        this.tiles[end.row][end.column].updateState(statesEnum.target);
        
        // Run a randomized depth-first search algorithm to generate maze
        let visited = [];
        for (let i=0;i<rows;i++) {
            visited.push([]);
            for (let j=0;j<columns;j++) {
                visited[i].push(false);
            }
        }
        
        let stack = [{row : start.row, column : start.column}]
        visited[start.row][start.column] = true;
        while (stack.length > 0) { // Until all cells visited
            let current = stack.pop();
            
            // Holds also invalid neighbors
            let neighbors = [
                {row : current.row, column : current.column-2},
                {row : current.row, column : current.column+2},
                {row : current.row-2, column : current.column},
                {row : current.row+2, column : current.column}
            ];
            // Randomize neighbors
            shuffleArray(neighbors);
            // Holds only valid neighbors
            let newNeighbors = [];
            let pushBack = false;
            
            // Process neighbor cells
            for (let i=0;i<4;i++) { 
                // Invalid neighbor conditions
                if (neighbors[i].row <= 0 || neighbors[i].row >= rows-1) continue;
                if (neighbors[i].column <= 0 || neighbors[i].column >= columns-1) continue;
                if (visited[neighbors[i].row][neighbors[i].column]) continue;
                
                // Has unvisited neighbors, keep current in stack.
                if (!pushBack) {
                    pushBack = true;
                    stack.push(current);
                }
                newNeighbors.push(neighbors[i]);
            }
            // Time to break a random neighbor wall
            if (pushBack) {
                let chosen = newNeighbors[0];
                stack.push(chosen);
                visited[chosen.row][chosen.column] = true;
                // Break wall between
                this.tiles[(chosen.row+current.row)/2][(chosen.column+current.column)/2].updateState(statesEnum.empty);
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

    getPlayerPos() {

    }

    saveState() {

    }

    updateState() {

    }

}

export {BaseGameBoard};