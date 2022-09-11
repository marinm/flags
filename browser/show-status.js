import showNote from './show-note.js';
import $ from './fake-jquery.js';

function restart(gameboardCanvas, boardClicks) {
    gameboardCanvas.restart();
    boardClicks.on();
}

function off(gameboardCanvas, boardClicks) {
    boardClicks.off();
    gameboardCanvas.showdisabled();
    $('#turn-score-container').addClass('not-playing');
}


const map = {
    'disconnected':
    function(gameboardCanvas, boardClicks) {
        off(gameboardCanvas, boardClicks);
        showNote('disconnected');
    },

    'waiting':
    function(gameboardCanvas, boardClicks) {
        off(gameboardCanvas, boardClicks);
        showNote('waiting');
    },

    'start':
    function(gameboardCanvas, boardClicks) {
        restart(gameboardCanvas, boardClicks);
        showNote('start');
    },

    'busy':
    function(gameboardCanvas, boardClicks) {
        off(gameboardCanvas, boardClicks);
        showNote('busy');
    },

    'opponent-disconnected':
    function(gameboardCanvas, boardClicks) {
        off(gameboardCanvas, boardClicks);
        showNote('opponent-disconnected');
    },

    'your-turn':
    function(gameboardCanvas, boardClicks) {
        $('#player-0-score-box').addClass('active-turn');
        $('#player-1-score-box').removeClass('active-turn');
        showNote('your-turn');
    },

    'opponents-turn':
    function(gameboardCanvas, boardClicks) {
        $('#player-0-score-box').removeClass('active-turn');
        $('#player-1-score-box').addClass('active-turn');
        showNote('opponents-turn');
    },

    'winner':
    function(gameboardCanvas, boardClicks) {
        off(gameboardCanvas, boardClicks);
        showNote('winner');
    },
};

export default
function showStatus(status, gameboardCanvas, boardClicks) {
    // Caller responsible for passing in valid status string
    map[status](gameboardCanvas, boardClicks);
};