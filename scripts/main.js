import {DisplayBoard} from "./displayControl.js";
import {BaseGameBoard} from "./game_types/baseGame.js";


let gameContainer = document.getElementById("main-section");
let startButton = document.getElementById("start-button");

let leftButton = document.getElementById("left-button");
let downButton = document.getElementById("down-button");
let upButton = document.getElementById("up-button");
let rightButton = document.getElementById("right-button");

function startGame() {
    let board = new BaseGameBoard(31, 51);
    let displayController = new DisplayBoard(document, gameContainer, board);
    displayController.updateDisplay();

    leftButton.onclick= function() {
        board.movePlayer({row : 0, column : -1});
        board.updateState();
        displayController.updateDisplay();
    };
    rightButton.onclick= function() {
        board.movePlayer({row : 0, column : 1});
        board.updateState();
        displayController.updateDisplay();
    };
    upButton.onclick= function() {
        board.movePlayer({row : -1, column : 0});
        board.updateState();
        displayController.updateDisplay();
    };
    downButton.onclick= function() {
        board.movePlayer({row : 1, column : 0});
        board.updateState();
        displayController.updateDisplay();
    };
}

startButton.onclick=startGame;