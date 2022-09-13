import $ from './fake-jquery.js';

function restart(view, clickboard) {
    view.canvasboard.restart();
    clickboard.on();
}

function off(view, clickboard) {
    clickboard.off();
    view.canvasboard.showdisabled();
    $('#turn-score-container').addClass('not-playing');
}


const map = {
    'disconnected':
    function(view, clickboard) {
        off(view, clickboard);
        view.notebox.say('disconnected');
    },

    'waiting':
    function(view, clickboard) {
        off(view, clickboard);
        view.notebox.say('waiting');
    },

    'start':
    function(view, clickboard) {
        restart(view, clickboard);
        view.notebox.say('start');
    },

    'busy':
    function(view, clickboard) {
        off(view, clickboard);
        view.notebox.say('busy');
    },

    'opponent-disconnected':
    function(view, clickboard) {
        off(view, clickboard);
        view.notebox.say('opponent-disconnected');
    },

    'your-turn':
    function(view, clickboard) {
        $('#player-0-score-box').addClass('active-turn');
        $('#player-1-score-box').removeClass('active-turn');
        view.notebox.say('your-turn');
    },

    'opponents-turn':
    function(view, clickboard) {
        $('#player-0-score-box').removeClass('active-turn');
        $('#player-1-score-box').addClass('active-turn');
        view.notebox.say('opponents-turn');
    },

    'winner':
    function(view, clickboard) {
        off(view, clickboard);
        view.notebox.say('winner');
    },
};

export default
function showStatus(status, view, clickboard) {
    // Caller responsible for passing in valid status string
    map[status](view, clickboard);
};