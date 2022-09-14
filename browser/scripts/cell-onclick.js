export default
function cellOnClick(i, j, { gamestate, selectTile, socket }) {
    // Player out of turn
    // Do nothing
    if (gamestate.turn != gamestate.playingAs) return;

    // Clicked on already revealed tile
    // Do nothing
    if (gamestate.board.at(i,j).hidden === false) return;

    // Send select message to server
    selectTile(i, j, socket);
};