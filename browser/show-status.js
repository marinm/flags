import showNote from './show-note.js';

const map = {
    'disconnected':
    function(board) {
        showNote('disconnected');
        board.showdisabled();
    },

    'waiting':
    function(board) {
        showNote('waiting');
        board.showdisabled();
        // also disable other components...
    },

    'start':
    function(board) {
        showNote('start');
        board.restart();
        // also enable other components...
    },

    'busy':
    function(board) {
        showNote('busy');
        board.showdisabled();
        // also disable other components...
    },

    'opponent-disconnected':
    function(board) {
        showNote('opponent-disconnected');
        board.showdisabled();
        $('#turn-score-container').addClass('not-playing');
        // also disable other components...
    },

    'your-turn':
    function(board) {
        showNote('your-turn');
    },

    'opponents-turn':
    function(board) {
        showNote('opponents-turn');
    },

    'winner':
    function(board) {
        showNote('winner');
        board.showdisabled();
    },
};


export default
function showStatus(status, board) {
    // Caller responsible for passing in valid status string
    map[status](board);
};