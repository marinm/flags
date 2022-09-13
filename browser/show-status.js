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
    function(notebox, canvasboard, clickboard) {
        off(canvasboard, clickboard);
        notebox.say('disconnected');
    },

    'waiting':
    function(notebox, canvasboard, clickboard) {
        off(canvasboard, clickboard);
        notebox.say('waiting');
    },

    'start':
    function(notebox, canvasboard, clickboard) {
        restart(canvasboard, clickboard);
        notebox.say('start');
    },

    'busy':
    function(notebox, canvasboard, clickboard) {
        off(canvasboard, clickboard);
        notebox.say('busy');
    },

    'opponent-disconnected':
    function(notebox, canvasboard, clickboard) {
        off(canvasboard, clickboard);
        notebox.say('opponent-disconnected');
    },

    'your-turn':
    function(notebox, canvasboard, clickboard) {
        $('#player-0-score-box').addClass('active-turn');
        $('#player-1-score-box').removeClass('active-turn');
        notebox.say('your-turn');
    },

    'opponents-turn':
    function(notebox, canvasboard, clickboard) {
        $('#player-0-score-box').removeClass('active-turn');
        $('#player-1-score-box').addClass('active-turn');
        notebox.say('opponents-turn');
    },

    'winner':
    function(notebox, canvasboard, clickboard) {
        off(canvasboard, clickboard);
        notebox.say('winner');
    },
};

export default
function showStatus(status, notebox, canvasboard, clickboard) {
    // Caller responsible for passing in valid status string
    map[status](notebox, canvasboard, clickboard);
};