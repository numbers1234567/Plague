import {DisplayBoard} from "./displayControl.js";
import {BaseGameBoard} from "./state/game_types/baseGame.js";
import {findMinSpeed} from "./boardAnalysis.js";


let gameContainer = document.getElementById("main-section");
let startButton = document.getElementById("start-button");

let leftButton = document.getElementById("left-button");
let downButton = document.getElementById("down-button");
let upButton = document.getElementById("up-button");
let rightButton = document.getElementById("right-button");

let board = undefined;
let displayController = undefined

function onLose() {
    console.log("lose");
}

function onWin() {
    console.log("win");
}

/**
 * Sets up the button behavior for the game
 * @param {int} playerSpeed - How many moves the player moves per rat step
 */
function setButtons(playerSpeed) {
    let speed = playerSpeed;
    let steps=0;
    leftButton.onclick= function() {
        board.movePlayer({row : 0, column : -1});
        if (++steps%speed==0) board.updateState();
        displayController.updateDisplay();
    };
    rightButton.onclick= function() {
        board.movePlayer({row : 0, column : 1});
        if (++steps%speed==0) board.updateState();
        displayController.updateDisplay();
    };
    upButton.onclick= function() {
        board.movePlayer({row : -1, column : 0});
        if (++steps%speed==0) board.updateState();
        displayController.updateDisplay();
    };
    downButton.onclick= function() {
        board.movePlayer({row : 1, column : 0});
        if (++steps%speed==0) board.updateState();
        displayController.updateDisplay();
    };
}

/**
 * Stuff like player speed and general difficulty settings
 */
function applySettings() {
    
}

function startGame() {
    board = new BaseGameBoard(31, 51);
    displayController = new DisplayBoard(document, gameContainer, board);
    displayController.updateDisplay();
    board.updateState();
    let playerSpeed = findMinSpeed(board);
    setButtons(findMinSpeed(board));

}

startButton.onclick=startGame;