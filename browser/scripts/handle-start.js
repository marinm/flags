export default
function handle_start(
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
    showStatus('start', view, boardclicks);

    $('#player-0-score-box').addClass('active-turn');
    $('#turn-score-container').removeClass('not-playing');

    showTurn(gamestate, view, boardclicks);
};