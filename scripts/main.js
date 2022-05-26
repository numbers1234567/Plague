import {DisplayBoard} from "./displayControl.js";
import {BaseGameBoard} from "./state/game_types/baseGame.js";
import {bfsShortestPath, findMinSpeed} from "./boardAnalysis.js";
import { getBaseGameSettings } from "./settings.js";
import { TrickyGameBoard } from "./state/game_types/trickyGame.js";
import { statesEnum } from "./state/states.js";


let gameContainer = document.getElementById("main-section");

let startButton = document.getElementById("start-button");
let leftButton = document.getElementById("left-button");
let downButton = document.getElementById("down-button");
let upButton = document.getElementById("up-button");
let rightButton = document.getElementById("right-button");
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
    disableAllButtons();
    document.getElementById("lose-notif").style["display"] = "block";
}

function onWin() {
    disableAllButtons();
    document.getElementById("win-notif").style["display"] = "block";
}

let stepNumber=0;
let speed;
// Update board based on player movement
function updateAll(playerOffset) {
    board.movePlayer(playerOffset);
    if ((++stepNumber)%speed==0) board.updateState();
    displayController.updateDisplay(500);
    if (board.stateWon()) onWin();
    if (board.stateLost()) onLose();
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
            updateAll({row : path[i].row*-1, column : path[i].column*-1});
            setTimeout(function() { performMoves(path, --i) }, 200);
        }
    }
    performMoves(reversePath, reversePath.length-1);
}

/**
 * Sets up the button behavior for the game
 * @param {int} playerSpeed - How many moves the player moves per rat step
 */
function setButtons(playerSpeed) {
    speed = playerSpeed;

    startButton.onclick = undefined;
    
    solveButton.onclick = function() { solveAll(playerSpeed) };
    leftButton.onclick= function() { updateAll({row : 0, column : -1}) };
    rightButton.onclick= function() { updateAll({row : 0, column : 1}) };
    upButton.onclick= function() { updateAll({row : -1, column : 0}) };
    downButton.onclick= function() { updateAll({row : 1, column : 0}) };
}

function disableAllButtons() {
    let buttons = [startButton, solveButton, leftButton, rightButton, upButton, downButton];
    for (let i=0;i<buttons.length;i++) 
        buttons[i].onclick = undefined;
    
}

/* Game Initializations */
function baseGame() {
    let settings = getBaseGameSettings();

    board = new BaseGameBoard(settings.rows, settings.columns, undefined, settings.numHoles, undefined, settings.bias);
    
    displayController = new DisplayBoard(document, gameContainer, board);
    displayController.updateDisplay(500);

    let playerSpeed = findMinSpeed(board);
    setButtons(playerSpeed);
}

function trickyGame() {
    let settings = getBaseGameSettings();
    board = new TrickyGameBoard(settings.rows, settings.columns, settings.numHoles, undefined, settings.bias);
    
    displayController = new DisplayBoard(document, gameContainer, board);

    displayController.updateDisplay(500);

    let playerSpeed = findMinSpeed(board);
    setButtons(playerSpeed);
}

init();