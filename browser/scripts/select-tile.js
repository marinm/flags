export default
function selectTile(i, j, gamestate, socket) {
    // Selecting a tile is a network event, though it presents like a GUI event.
    // A tile is selected after the server has ACK'ed and approved the select
    // REQ.

    if (gamestate.turn === gamestate.playingAs) {
        socket.send({type: 'select', i, j});
    }
};