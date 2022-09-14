export default
function handle_opponent_disconnected(
    message,
    $,
    controls,
    view,
    gamestate,
    socket,
    boardclicks,
    showTurn,
    showStatus,
    autoplay,
    selectTile
) {
    showStatus('opponent-disconnected', view, boardclicks);
};