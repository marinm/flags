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

const notebox  = NoteBox($, '#note-box');
const scorebox = ScoreBox($, ['#player-0-score', '#player-1-score']);

const controls = {
    autoplay  : false,
};

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
if (!socket) showStatus('disconnected', notebox, gameboardCanvas, boardClicks);


function onError() {
    showStatus('disconnected', notebox, gameboardCanvas, boardClicks);
}

function onOpen() {
    // Do nothing...?
}

function onClose() {
    showStatus('disconnected', notebox, gameboardCanvas, boardClicks);
}

function onMessage(quicksocket, message) {
    handleMessage(
        message,
        $,
        controls,
        notebox,
        scorebox,
        gameboardCanvas,
        gamestate,
        quicksocket,
        boardClicks
    );
}


//------------------------------------------------------------------------------

$('#board-container').append(gameboardCanvas.canvas);

$('.remaining').text(' / ' + WINNING_SCORE);


document.addEventListener("keyup", function(event) {
    switch (event.keyCode) {
        case 65: toggleAutoplay(controls, autoplay, $, gamestate, gameboardCanvas, socket);  break; /* a */
        case 71: autoplay.solverscan(gamestate, gameboardCanvas);                 break; /* g */
        case 78: autoplay.select_next_unrevealed_flag(gamestate, socket);         break; /* n */
    }
});