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
       for (let i=0;i<this.nRows;i++) {
            for (let j=0;j<this.nCols;j++) {
                this.updateTileColor(i, j)
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
            case (statesEnum.empty): return colorCodes.pureWhite;
            case (statesEnum.wall): return colorCodes.pureBlack;
            case (statesEnum.player): return colorCodes.pureRed;
            case (statesEnum.target): return colorCodes.pureGreen;
            default: return colorCodes.purePurple;
        }
    }

    /**
     * Update the visuals of the tile with the given row and column.
     * Based off values set in the board property
     * @param {int} row 
     * @param {int} column 
     */
    updateTileColor(row, column) {
        //console.log(this.stateToColor(this.board.getTileState(row, column)));
        this.elements[row][column].style["background-color"] = this.stateToColor(this.board.getTileState(row, column));
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