import {colorCodes, statesEnum} from "./state/states.js";

class DisplayBoard {
    
    /**
     * 
     * @param {Node} parent - HTML element which is the game container
     */
    constructor(document, parent, board) {
        this.board = board;
        this.nRows = board.nRows;
        this.nCols = board.nCols;
        
        this.table = document.createElement("table");
        parent.appendChild(this.table);

        this.table.color = "red";
        
        // elements[i, j] -> corresponding HTML element
        this.elements = [];

        this.dummy = document.getElementById("dummy");
        for (let i=0;i<this.nRows;i++) {
            const row = document.createElement("tr");
            this.table.appendChild(row);

            this.elements.push([]);
            
            for (let j=0;j<this.nCols;j++) {
                let cell = document.createElement("td");
                row.appendChild(cell);

                let square = document.createElement("div");
                cell.appendChild(square);
                square.classList.add("tile");
                square.style['width'] = "15px";
                square.style['height'] = "15px";
                square.style['border-radius'] = "3px";


                this.elements[i].push(square);
            }
        }
    }
    /* 
    *
    * * * * * * * * *
    * VISUALIZATION *
    * * * * * * * * *
    * 
    * Methods for visualizing and animating board.
    * Can easily spruce this up later with animations.
    * 
    */
   
   updateDisplay() {
       let controller = this;
       for (let i=0;i<this.nRows;i++) {
            for (let j=0;j<this.nCols;j++) {
                controller.updateTileColor(i, j);
            }
        }
    }

    stateToColor(state) {
        switch (state) {
            case (statesEnum.empty): return colorCodes.white;
            case (statesEnum.wall): return colorCodes.black;
            case (statesEnum.player): return colorCodes.red;
            case (statesEnum.target): return colorCodes.green;
            case (statesEnum.rat): return colorCodes.purple;
            case (statesEnum.hole): return colorCodes.brown;
            default: return undefined;
        }
    }

    /**
     * Update visual based on board state
     * Animates
     * @param {int} row 
     * @param {int} column 
     */
    updateTileColor(row, column) {
        let newColor = this.stateToColor(this.board.getTileState(row, column));
        
        this.dummy.style["background-color"] = newColor;
        if(this.elements[row][column].style['background-color'] === this.dummy.style['background-color']) return;
        
        this.elements[row][column].animate([
            { transform: 'scale(1)' }, {transform: 'scale(0)'}], 
            {duration : 500, iterations : 1});

        let controller = this;
        setTimeout(function() {
            controller.elements[row][column].style["background-color"] = newColor;
            controller.elements[row][column].animate([{ transform: 'scale(0)' }, {transform: 'scale(1)'}], {duration : 500, iterations : 1});
        }, 490);
    }

    /**
     * Show the board.
     * Unhides the HTML element.
     */
    show() {
        this.table.style.display = "block";
    }
    
    /**
     * Hide the board. 
     * Hides the HTML element.
     */
    hide() {
        this.table.style.display = "none";
    }
}

export {DisplayBoard};