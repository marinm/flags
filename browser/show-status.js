import showNote from './show-note.js';
import $ from './fake-jquery.js';

function restart(canvasboard, clickboard) {
    canvasboard.restart();
    clickboard.on();
}

function off(canvasboard, clickboard) {
    clickboard.off();
    canvasboard.showdisabled();
    $('#turn-score-container').addClass('not-playing');
}


const map = {
    'disconnected':
    function(canvasboard, clickboard) {
        off(canvasboard, clickboard);
        showNote('disconnected');
    },

    'waiting':
    function(canvasboard, clickboard) {
        off(canvasboard, clickboard);
        showNote('waiting');
    },

    'start':
    function(canvasboard, clickboard) {
        restart(canvasboard, clickboard);
        showNote('start');
    },

    'busy':
    function(canvasboard, clickboard) {
        off(canvasboard, clickboard);
        showNote('busy');
    },

    'opponent-disconnected':
    function(canvasboard, clickboard) {
        off(canvasboard, clickboard);
        showNote('opponent-disconnected');
    },

    'your-turn':
    function(canvasboard, clickboard) {
        $('#player-0-score-box').addClass('active-turn');
        $('#player-1-score-box').removeClass('active-turn');
        showNote('your-turn');
    },

    'opponents-turn':
    function(canvasboard, clickboard) {
        $('#player-0-score-box').removeClass('active-turn');
        $('#player-1-score-box').addClass('active-turn');
        showNote('opponents-turn');
    },

    'winner':
    function(canvasboard, clickboard) {
        off(canvasboard, clickboard);
        showNote('winner');
    },
};

export default
function showStatus(status, canvasboard, clickboard) {
    // Caller responsible for passing in valid status string
    map[status](canvasboard, clickboard);
};