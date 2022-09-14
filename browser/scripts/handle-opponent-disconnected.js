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
    autoplay
) {
    showStatus('opponent-disconnected', view, boardclicks);
};