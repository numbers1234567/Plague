import {colorCodes, states, statesEnum} from "./states";

class DisplayBoard {
    
    /**
     * 
     * @param {Node} parent - HTML element which is the game container
     */
    constructor(document, parent, board) {
        this.table = document.createElement("table");
        this.board = board; // We work under the assumption that this is not modified.
        this.nRows = board.nRows;
        this.nCols = board.nCols;
        
        this.elements = [];
        // Create HTML elements and mappings from position to element.
        for (let i=0;i<this.nRows;i++) {
            // Create and place row
            const row = document.createElement("tr");
            parent.appendChild(row);

            this.elements.push([]);
            
            for (let j=0;j<this.nCols;j++) {
                // Create and place cell
                const cell = document.createElement("td");
                row.appendChild(cell);

                this.elements[i].push(cell);
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

    static stateToColor(state) {
        switch (state) {
            case statesEnum.empty: return colorCodes.pureWhite;
            case statesEnum.wall: return colorCodes.pureBlack;
            case statesEnum.player: return colorCodes.pureRed;
            case statesEnum.target: return colorCodes.pureGreen;
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
        this.elements[row][column].style.color = stateToColor(this.board.getTileState(row, column));
    }

    /**
     * Show the board. Fairly self-explanatory.
     * Actually unhides the HTML element.
     */
    show() {
        this.table.style.display = "none";
    }
    
    /**
     * Hide the board. Fairly self-explanatory.
     * Actually hides the HTML element.
     */
    hide() {
        this.table.style.display = "block";
    }
}