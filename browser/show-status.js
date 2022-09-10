import showNote from './show-note.js';
import $ from './fake-jquery.js';

function restart(board, boardClicks) {
    board.restart();
    boardClicks.on();
}

function off(board, boardClicks) {
    boardClicks.off();
    board.showdisabled();
    $('#turn-score-container').addClass('not-playing');
}


const map = {
    'disconnected':
    function(board, boardClicks) {
        off(board, boardClicks);
        showNote('disconnected');
    },

    'waiting':
    function(board, boardClicks) {
        off(board, boardClicks);
        showNote('waiting');
    },

    'start':
    function(board, boardClicks) {
        restart(board, boardClicks);
        showNote('start');
    },

    'busy':
    function(board, boardClicks) {
        off(board, boardClicks);
        showNote('busy');
    },

    'opponent-disconnected':
    function(board, boardClicks) {
        off(board, boardClicks);
        showNote('opponent-disconnected');
    },

    'your-turn':
    function(board, boardClicks) {
        $('#player-0-score-box').addClass('active-turn');
        $('#player-1-score-box').removeClass('active-turn');
        showNote('your-turn');
    },

    'opponents-turn':
    function(board, boardClicks) {
        $('#player-0-score-box').removeClass('active-turn');
        $('#player-1-score-box').addClass('active-turn');
        showNote('opponents-turn');
    },

    'winner':
    function(board, boardClicks) {
        off(board, boardClicks);
        showNote('winner');
    },
};

export default
function showStatus(status, board, boardClicks) {
    // Caller responsible for passing in valid status string
    map[status](board, boardClicks);
};