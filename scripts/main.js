import {DisplayBoard} from "./displayControl.js";
import {BaseGameBoard} from "./game_types/baseGame.js";


let gameContainer = document.getElementById("main-section");
let startButton = document.getElementById("start-button");

function startGame() {
    let board = new BaseGameBoard(21, 43);
    let displayController = new DisplayBoard(document, gameContainer, board);
    displayController.updateDisplay();
}

startButton.onclick=startGame;