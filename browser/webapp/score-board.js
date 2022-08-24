import {CanvasTiles} from '../canvas/canvas-tiles.js';

export
function FlagsBoard(params) {

    const canvasBoard = CanvasTiles({...params, onReady});

    function onReady() {
        canvasBoard.fillByCoordinates((i, j) => canvasBoard.CanvasBoardTile(i , j));

        // Draw the tile background layer
        canvasBoard.scan( (i, j, tile) => tile.draw('background', 'BACKGROUND') );
    }
}