// Event handlers for canvas clicks and server messages
// Model-View-[Controller]

import config from './config.js';
import GameboardCanvas from './gameboard-canvas.js';
import tilesheet from './tilesheet.js';
import $ from './fake-jquery.js';
import QuickWebSocket from './quick-websocket.js';
import showStatus from './show-status.js';
import clickableCells from './clickable-cells.js';
import cellOnClick from './cell-onclick.js';
import Board from './board.js';
import autoplay from './autoplay.js';
import toggleAutoplay from './toggle-autoplay.js';
import handleMessage from './handle-message.js';
import NoteBox from './note-box.js';
import ScoreBox from './score-box.js';

const {
    SERVER_ADDRESS,
    BOARD_NUM_ROWS,
    BOARD_NUM_COLUMNS,
    BOARD_CELL_SIZE,
    WINNING_SCORE,
    PLAYER_FLAGS,
} = config;



const view = {
    notebox:
    NoteBox($, '#note-box'),

    canvasboard:
    new GameboardCanvas(
        BOARD_NUM_ROWS,
        BOARD_NUM_COLUMNS,
        BOARD_CELL_SIZE,
        tilesheet,
    ),

    scorebox:
    ScoreBox($, ['#player-0-score', '#player-1-score'])
};


const controls = {
    autoplay  : false,
};

const gamestate = {
    playingAs : null,
    board     : Board(BOARD_NUM_ROWS, BOARD_NUM_COLUMNS),
    turn      : null,
    winner    : null,
};




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
    element : view.canvasboard.canvas,
    w       : BOARD_CELL_SIZE,
    h       : BOARD_CELL_SIZE,
    onclick : cellOnClick,
    context : { gamestate, canvasboard: view.canvasboard, socket },
});

// This is not necessary if an error event is also fired on fail
if (!socket) showStatus('disconnected', view.notebox, view.canvasboard, boardClicks);


function onError() {
    showStatus('disconnected', view.notebox, view.canvasboard, boardClicks);
}

function onOpen() {
    // Do nothing...?
}

function onClose() {
    showStatus('disconnected', view.notebox, view.canvasboard, boardClicks);
}

function onMessage(quicksocket, message) {
    handleMessage(
        message,
        $,
        controls,
        view.notebox,
        view.scorebox,
        view.canvasboard,
        gamestate,
        quicksocket,
        boardClicks
    );
}


//------------------------------------------------------------------------------

$('#board-container').append(view.canvasboard.canvas);

$('.remaining').text(' / ' + WINNING_SCORE);


document.addEventListener("keyup", function(event) {
    switch (event.keyCode) {
        case 65: toggleAutoplay(controls, autoplay, $, gamestate, view.canvasboard, socket);  break; /* a */
        case 71: autoplay.solverscan(gamestate, view.canvasboard);                 break; /* g */
        case 78: autoplay.select_next_unrevealed_flag(gamestate, socket);         break; /* n */
    }
});