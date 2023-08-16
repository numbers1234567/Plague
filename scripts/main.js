import {DisplayBoard} from "./displayControl.js";
import {BaseGameBoard} from "./state/game_types/baseGame.js";
import {bfsShortestPath, findMinSpeed} from "./boardAnalysis.js";
import { getBaseGameSettings } from "./settings.js";
import { TrickyGameBoard } from "./state/game_types/trickyGame.js";
import { statesEnum } from "./state/states.js";
import { Queue } from "./state/aux_structures/queue.js";


let gameContainer = document.getElementById("main-section");

let startButton = document.getElementById("start-button");
let solveButton = document.getElementById("solve-all");

let baseGameSelect = document.getElementById("base-game-select");
let trickyGameSelect = document.getElementById("tricky-game-select");

function init() {
    startButton.onclick = baseGame;
}

// Manipulates selected and unselected classes
function switchSetting(newSettingContainer) {
    let selectedSetting = document.getElementsByClassName("selected")[0];
    selectedSetting.classList.remove("selected");
    selectedSetting.classList.add("unselected");
    
    newSettingContainer.classList.remove("unselected");
    newSettingContainer.classList.add("selected");
}

baseGameSelect.onclick = function() {
    switchSetting(document.getElementById("base-game-settings"))
    startButton.onclick = baseGame;
}

trickyGameSelect.onclick = function() {
    switchSetting(document.getElementById("base-game-settings"))
    startButton.onclick = trickyGame;
}

let board = undefined;
let displayController = undefined

function onLose() {
    disableGameplayControls();
    document.getElementById("lose-notif").style["display"] = "block";
}

function onWin() {
    disableGameplayControls();
    console.log("winner!");
    document.getElementById("win-notif").style["display"] = "block";
}

let stepNumber=0;
let speed;
let moveQueue = new Queue();

let updateAllLock = false;
// Performs movement. Use a lock to prevent concurrent calls.
function playerMoveAux(ignoreLock=false) {
    if (updateAllLock && !ignoreLock) return;
    updateAllLock = true;
    if (!moveQueue.isEmpty()) {
        board.movePlayer(moveQueue.pop());
        if ((++stepNumber)%speed==0) board.updateState();
        displayController.updateDisplay(500);
        if (board.stateWon()) onWin();
        if (board.stateLost()) onLose();
        setTimeout(function() {playerMoveAux(ignoreLock=true)}, 500);
    }
    else updateAllLock = false;
}
// Update board based on player movement
function playerMove(playerOffset) {
    moveQueue.push(playerOffset);
    playerMoveAux();
}

// Plays the game from the current state to finish.
function solveAll(playerSpeed) {
    function canTraverseRats(board, cell, bfsState) {
        if (board.getTileState(cell.row, cell.column)==statesEnum.wall) return false;
        if (cell.row <= 0 || cell.row >= board.nRows-1) return false;
        if (cell.column <= 0 || cell.column >= board.nCols-1) return false;
        if ((bfsState.distances[bfsState.currentCell.row][bfsState.currentCell.column]+1)/playerSpeed >= board.etaMatrix[cell.row][cell.column]) return false;
        return true;
    }
    // Perform bfs then deduce path from distances
    let reversePath = [];
    let playerPos = board.getPlayerPos();
    let distances = bfsShortestPath(board, board.nRows, board.nCols, playerPos, canTraverseRats);
    let target;
    for (let i=0;i<board.nRows;i++) {
        for (let j=0;j<board.nCols;j++) {
            if (board.getTileState(i,j)==statesEnum.target) target = {row : i, column : j};
        }
    }

    let current=target;
    // Determine path
    while (current.row!=playerPos.row || current.column!=playerPos.column) {
        // Minimum neighbor
        let offsets = [
            {row : 0, column : -1}, 
            {row : 0, column : +1},
            {row : -1, column : 0},
            {row : +1, column : 0}
        ];

        let nextMove = offsets[0];
        let nextMoveDist = distances[nextMove.row+current.row][nextMove.column+current.column];
        for (let i=1;i<4;i++) {
            let thisDistance = distances[current.row+offsets[i].row][current.column+offsets[i].column]
            if (thisDistance < nextMoveDist) {
                nextMove = offsets[i];
                nextMoveDist = thisDistance;
            }
        }
        reversePath.push(nextMove);
        current = {row : nextMove.row+current.row, column : nextMove.column+current.column};
    }

    // No sleep function. Recursively call function with timeout.
    function performMoves(path, i) {
        if (i>=0) {
            playerMove({row : path[i].row*-1, column : path[i].column*-1});
            setTimeout(function() { performMoves(path, --i) }, 200);
        }
    }
    performMoves(reversePath, reversePath.length-1);
}

/**
 * Sets up the button behavior for gameplay
 * @param {int} playerSpeed - How many moves the player moves per rat step
*/
function enableMovementControls(event) {
    switch (event.code) {
    case "ArrowUp":
        playerMove({row : -1, column : 0});
        break;
    case "ArrowRight":
        playerMove({row : 0, column : 1});
        break;
    case "ArrowDown":
        playerMove({row : 1, column : 0});
        break;
    case "ArrowLeft":
        playerMove({row : 0, column : -1});
        break;
    }
}
function enableGameplayControls(playerSpeed) {
    speed = playerSpeed;
    
    document.addEventListener("keyup", enableMovementControls);
    startButton.onclick = undefined;
    
    solveButton.onclick = function() { solveAll(playerSpeed) };
}

function disableGameplayControls() {
    let buttons = [startButton, solveButton];
    for (let i=0;i<buttons.length;i++) 
        buttons[i].onclick = undefined;
    document.removeEventListener("keyup", enableMovementControls);
}

/* Game Initializations */
function baseGame() {
    let settings = getBaseGameSettings();

    board = new BaseGameBoard(settings.rows, settings.columns, undefined, settings.numHoles, undefined, settings.bias);
    
    displayController = new DisplayBoard(document, gameContainer, board);
    displayController.updateDisplay(500);

    let playerSpeed = findMinSpeed(board);
    enableGameplayControls(playerSpeed);
}

function trickyGame() {
    let settings = getBaseGameSettings();
    board = new TrickyGameBoard(settings.rows, settings.columns, settings.numHoles, undefined, settings.bias);
    
    displayController = new DisplayBoard(document, gameContainer, board);

    displayController.updateDisplay(500);

    let playerSpeed = findMinSpeed(board);
    enableGameplayControls(playerSpeed);
}

init();