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
    showStatus('start', view, boardclicks);

    view.$('#player-0-score-box').addClass('active-turn');
    view.$('#turn-score-container').removeClass('not-playing');

    showTurn(gamestate, view, boardclicks);
};