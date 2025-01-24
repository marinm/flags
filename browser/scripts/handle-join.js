export default
function handle_join(
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
    if (message.status === 'OPEN') {
        console.log(message);

        gamestate.playingAs = message.playing_as;
        gamestate.turn = 0;

        // wait for the game-start message
        showStatus('waiting', view, boardclicks); 

        if (Number(gamestate.playingAs) === 0) {
            view.$('#player-0-score-box').addClass('playing-as');
        }
        else if (Number(gamestate.playingAs) === 1) {
            view.$('#player-1-score-box').addClass('playing-as');
        }
    }
    else {
        // nobody to play with...
        showStatus('busy', view, boardclicks);
    }
};