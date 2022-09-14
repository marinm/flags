export default
function toggleAutoplay(controls, autoplay, $, gamestate, canvas, socket, selectTile) {
    // Instead of importing autoplay, pass it in as a dependency

    // If the board is not available, do nothing
    if (!canvas.ready()) return;

    controls.autoplay = !(controls.autoplay);
    $('#autoplay-indicator').css('visibility', (controls.autoplay)? 'visible' : 'hidden');

    if (controls.autoplay && gamestate.turn === gamestate.playingAs) {
        autoplay.select_next_unrevealed_flag({gamestate, selectTile, socket});
    }

    if (!controls.autoplay) {
        // Hide select guides
        canvas.forEach((i,j,tile) => tile.erase('guide'));
    }
}