import {DisplayBoard} from "./displayControl.js";
import {BaseGameBoard} from "./state/game_types/baseGame.js";
import {findMinSpeed} from "./boardAnalysis.js";
import { getBaseGameSettings } from "./settings.js";
import { TrickyGameBoard } from "./state/game_types/trickyGame.js";


let gameContainer = document.getElementById("main-section");

let startButton = document.getElementById("start-button");
let leftButton = document.getElementById("left-button");
let downButton = document.getElementById("down-button");
let upButton = document.getElementById("up-button");
let rightButton = document.getElementById("right-button");

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
    console.log("Base Game Selected!");
}

trickyGameSelect.onclick = function() {
    switchSetting(document.getElementById("base-game-settings"))
    startButton.onclick = trickyGame;
    console.log("Tricky Game Selected!");
}

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

    function updateAll(playerOffset) {
        board.movePlayer(playerOffset);
        if ((++steps)%speed==0) board.updateState();
        displayController.updateDisplay();
    }
    leftButton.onclick= function() { updateAll({row : 0, column : -1}) };
    rightButton.onclick= function() { updateAll({row : 0, column : 1}) };
    upButton.onclick= function() { updateAll({row : -1, column : 0}) };
    downButton.onclick= function() { updateAll({row : 1, column : 0}) };
}

/**
 * Stuff like player speed and general difficulty settings
 */
function applySettings() {
    
}

function baseGame() {
    let settings = getBaseGameSettings();

    board = new BaseGameBoard(settings.rows, settings.columns, undefined, settings.numHoles, undefined, settings.bias);
    
    displayController = new DisplayBoard(document, gameContainer, board);
    displayController.updateDisplay();

    let playerSpeed = findMinSpeed(board);
    setButtons(playerSpeed);
}

function trickyGame() {
    let settings = getBaseGameSettings();
    board = new TrickyGameBoard(settings.rows, settings.columns, settings.numHoles, undefined, settings.bias);
    
    displayController = new DisplayBoard(document, gameContainer, board);
    displayController.updateDisplay();

    let playerSpeed = findMinSpeed(board);
    setButtons(playerSpeed);
}

init();