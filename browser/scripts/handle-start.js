export default
function handle_start(
    message,
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
    // This message only appears for a split second before the next message
    // replaces it.
    showStatus('start', view, boardclicks);

    view.scorebox.on();
    view.scorebox.showTurn(0);

    showTurn(gamestate, view, showStatus, boardclicks);
};