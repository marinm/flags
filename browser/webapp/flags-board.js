import {CanvasTiles} from '../canvas/canvas-tiles.js';
import {Board} from '../game/board.js';

export
function FlagsBoard(params) {

    // Start the game model
    // The game model is then ready for play
    const gameBoard = Board({
        numRows    : params.board.numRows,
        numColumns : params.board.numColumns,
        numFlags   : params.board.numFlags
    });

    // Set up the clickable areas on the given canvas
    const canvasBoard = CanvasTiles({...params, onReady});

    function select(i, j, canvasTile) {
        const result = gameBoard.select(i, j);

        if (!result)
            return;

        for (const tile of result) {
            const resultTile = canvasBoard.at(tile.i, tile.j);
            resultTile.clear();
            resultTile.draw('noname', String(tile.value));
        }
    }

    // Wait for the tilesheet image to finish loading
    function onReady() {
        // Set up the board with tiles
        canvasBoard.fillByCoordinates( (i, j) => canvasBoard.CanvasBoardTile(i , j) );

        // Draw the tile background layer
        canvasBoard.scan( (i, j, tile) => tile.draw('background', 'BACKGROUND') );

        // Set up the onclick callback
        canvasBoard.onclick( (i, j, tile) => select(i, j, tile) );
    }
};