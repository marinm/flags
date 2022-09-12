// Event handlers for canvas clicks and server messages
// Model-View-[Controller]

import config from './config.js';
import GameboardCanvas from './gameboard-canvas.js';
import tilesheet from './tilesheet.js';
import $ from './fake-jquery.js';
import QuickWebSocket from './quick-websocket.js';
import showStatus from './show-status.js';
import showTurn from './show-turn.js';
import showScores from './show-scores.js';
import showWinner from './show-winner.js';
import clickableCells from './clickable-cells.js';
import cellOnClick from './cell-onclick.js';
import Board from './board.js';
import autoplay from './autoplay.js';

const {
    SERVER_ADDRESS,
    BOARD_NUM_ROWS,
    BOARD_NUM_COLUMNS,
    BOARD_CELL_SIZE,
    WINNING_SCORE,
    PLAYER_FLAGS,
} = config;

const gamestate = {
    playingAs : null,
    board     : Board(BOARD_NUM_ROWS, BOARD_NUM_COLUMNS),
    turn      : null,
    winner    : null,
};

// Set up the board
const gameboardCanvas = new GameboardCanvas(
    BOARD_NUM_ROWS,
    BOARD_NUM_COLUMNS,
    BOARD_CELL_SIZE,
    tilesheet,
);


//
// WebSocket Messaging

const socket = QuickWebSocket({
    url       : SERVER_ADDRESS,
    onError   : onError,
    onOpen    : onOpen,
    onMessage : onMessage,
    onClose   : onClose,
});

// Add on-click event listener to the canvas
const boardClicks = clickableCells({
    element : gameboardCanvas.canvas,
    w       : BOARD_CELL_SIZE,
    h       : BOARD_CELL_SIZE,
    onclick : cellOnClick,
    context : { gamestate, gameboardCanvas, socket },
});

// This is not necessary if an error event is also fired on fail
if (!socket) showStatus('disconnected', gameboardCanvas, boardClicks);


function onError() {
    showStatus('disconnected', gameboardCanvas, boardClicks);
}

function onOpen() {
    // Do nothing...?
}

function onClose() {
    showStatus('disconnected', gameboardCanvas, boardClicks);
}

function onMessage(quicksocket, message) {
    // If the event/message type is not recognized, discard/ignore it
    if (!Object.keys(handlers).includes(message.type)) return;
  
    // call the appropriate handler
    handlers[message.type](message, gameboardCanvas, gamestate);
}


//------------------------------------------------------------------------------

$('#board-container').append(gameboardCanvas.canvas);

$('.remaining').text(' / ' + WINNING_SCORE);



// Callbacks

const handlers = {
    online:
    function(message) {
        // unused
    },

    join:
    function(message) {
        if (message.status === 'OPEN') {
            gamestate.playingAs = message.playing_as;
            gamestate.turn = 0;

            // wait for the game-start message
            showStatus('waiting', gameboardCanvas, boardClicks); 

            if (Number(gamestate.playingAs) === 0) {
                $('#player-0-score-box').addClass('playing-as');
            }
            else if (Number(gamestate.playingAs) === 1) {
                $('#player-1-score-box').addClass('playing-as');
            }
        }
        else {
            // nobody to play with...
            showStatus('busy', gameboardCanvas, boardClicks);
        }
    },

    start:
    function(message) {
        showStatus('start', gameboardCanvas, boardClicks);

        $('#player-0-score-box').addClass('active-turn');
        $('#turn-score-container').removeClass('not-playing');

        showTurn(gamestate, gameboardCanvas, boardClicks);
    },

    'opponent-disconnected':
    function(message) {
        showStatus('opponent-disconnected', gameboardCanvas, boardClicks);
    },

    reveal:
    function(message) {
        const revealed = message;
        if (!revealed) {
            // ... do something here
            // out-of-bounds or game already over
        }

        gamestate.turn = revealed.turn;

        revealed.show.forEach(function(item) {
            gamestate.board.set(item.i, item.j,
                {
                    i      : item.i,
                    j      : item.j,
                    hidden : false,
                    value  : item.value,
                    owner  : item.owner,
                }
            );
            gameboardCanvas.setvalue(item.i, item.j, item.value, item.owner);
            gameboardCanvas.at(item.i, item.j).erase('guide');
        });

        const selected = message.for;
        gameboardCanvas.select(selected.i, selected.j);

        showScores(revealed.score);

        // The game is still on
        if (revealed.on) {
            showTurn(gamestate, gameboardCanvas, boardClicks);

            if (autoselect) {
                // React even if it's the opponent's turn
                autoplay.solverscan(gamestate, gameboardCanvas);
                if (gamestate.turn === gamestate.playingAs) {
                    // Select either a known,hidden flag or a random tile
                    autoplay.select_next_unrevealed_flag(gamestate, socket);
                }
            }
        }
        // Game is over
        else {
            gamestate.winner = gamestate.turn;
            showWinner(gamestate, gameboardCanvas, boardClicks);
        }
    },
};




let autoselect = false;

document.addEventListener("keyup", function(event) {
    switch (event.keyCode) {
        case 65: /* a */
            toggle_autoselect();
            break;
        case 71: /* g */
            autoplay.solverscan(gamestate, gameboardCanvas);
            break;
        case 78: /* n */
            autoplay.select_next_unrevealed_flag(gamestate, socket);
            break;
    }
});

function toggle_autoselect() {
    // If the board is not available, do nothing
    if (!gameboardCanvas.ready()) return;

    autoselect = !autoselect;
    $('#autoplay-indicator').css('visibility', (autoselect)? 'visible' : 'hidden');

    if (autoselect && gamestate.turn === gamestate.playingAs) {
        autoplay.select_next_unrevealed_flag(gamestate, socket);
    }

    if (!autoselect) {
        // Hide select guides
        gameboardCanvas.forEach((i,j,tile) => tile.erase('guide'));
    }
}
