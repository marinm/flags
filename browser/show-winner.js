import showStatus from './show-status.js';
import $ from './fake-jquery.js';

export default
function showWinner(gamestate, board, boardClicks) {

    // Show that the game is over and highlight who won the game

    const scoreBoxSelector = {
        0: '#player-0-score-box',
        1: '#player-1-score-box',
    };

    // Highlight winner in the score box
    $(scoreBoxSelector[gamestate.winner])
        .toggleClass('active-turn')
        .toggleClass('score-box-winner');

    showStatus('winner', board, boardClicks);
};