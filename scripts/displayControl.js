import {colorCodes, statesEnum} from "./states.js";

class DisplayBoard {
    
    /**
     * 
     * @param {Node} parent - HTML element which is the game container
     */
    constructor(document, parent, board) {
        this.board = board; // We work under the assumption that this is not modified.
        this.nRows = board.nRows;
        this.nCols = board.nCols;
        
        this.table = document.createElement("table");
        parent.appendChild(this.table);
        //this.table.width="100%";
        this.table.color = "red";
        
        this.elements = [];

        this.dummy = document.getElementById("dummy");
        // Create HTML elements and mappings from position to element.
        for (let i=0;i<this.nRows;i++) {
            // Create and place row
            const row = document.createElement("tr");
            //row.width=this.table.width;
            this.table.appendChild(row);

            this.elements.push([]);
            
            for (let j=0;j<this.nCols;j++) {
                // Create and place cell
                let cell = document.createElement("td");
                row.appendChild(cell);

                let square = document.createElement("div");
                cell.appendChild(square);
                square.classList.add("tile");

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
   
   /**
    * Updates the display given board. 
    */
   updateDisplay() {
       let controller = this;
       for (let i=0;i<this.nRows;i++) {
            for (let j=0;j<this.nCols;j++) {
                setTimeout(function() {controller.updateTileColor(i, j)}, 300);
            }
        }
    }

    /**
     * 
     * @param {int} state - state of a tile
     * @returns the color associated with the given tile state
     */

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
     * Update the visuals of the tile with the given row and column.
     * Based off values set in the board property
     * @param {int} row 
     * @param {int} column 
     */
    updateTileColor(row, column) {
        let newColor = this.stateToColor(this.board.getTileState(row, column));
        this.dummy.style["background-color"] = newColor;

        if(this.elements[row][column].style['background-color'] === this.dummy.style['background-color']) return;

        console.log(this.elements[row][column].style["background-color"]);
        this.elements[row][column].animate([{ transform: 'scale(1)' }, {transform: 'scale(0)'}], {duration : 1000, iterations : 1});
        this.elements[row][column].style["background-color"] = newColor;
        this.elements[row][column].animate([{ transform: 'scale(0)' }, {transform: 'scale(1)'}], {duration : 1000, iterations : 1});
        
    }

    /**
     * Show the board. Fairly self-explanatory.
     * Actually unhides the HTML element.
     */
    show() {
        this.table.style.display = "block";
    }
    
    /**
     * Hide the board. Fairly self-explanatory.
     * Actually hides the HTML element.
     */
    hide() {
        this.table.style.display = "none";
    }
}

export {DisplayBoard};