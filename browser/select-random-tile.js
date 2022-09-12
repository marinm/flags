import selectTile from './select-tile.js';

export default
function selectRandomTile(gamestate, socket) {
    let tile = null;
    do {
        [tile] = gamestate.board.random(1);
    }
    while (!tile.hidden || (tile.hidden && tile.noflag));
    // Repeat if tile is already revealed,
    // or if it's hidden but it's known not to be a flag
  
    selectTile(tile.i, tile.j, gamestate, socket);
}