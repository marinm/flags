import selectTile from './select-tile.js';

export default
function cellOnClick(i, j, context) {
    // context = { gamestate, board, socket }

    if (context.gamestate.turn != context.gamestate.playingAs) {
        // Player out of turn
        // Do nothing ...
    }
    else if (context.gameboardCanvas.tile(i,j).hidden === false) {
        // Clicked on already revealed tile
        // Do nothing ...
    }
    else {
        selectTile(i, j, context.gamestate, context.socket);
        // A clicked tile is not displayed as selected until the server confirms
        // the selection
    }
};