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
import selectTile from './select-tile.js';
import clickableCells from './clickable-cells.js';
import cellOnClick from './cell-onclick.js';
import Board from './board.js';
import selectRandomTile from './select-random-tile.js';

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
                solverscan();
                if (gamestate.turn === gamestate.playingAs) {
                    // Select either a known,hidden flag or a random tile
                    select_next_unrevealed_flag();
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








//------------------------------------------------------------------------------
// Solver

let autoselect = false;

document.addEventListener("keyup", function(event) {
    switch (event.keyCode) {
        case 65: toggle_autoselect();            break;   /* a */
        case 71: solverscan();                   break;   /* g */
        case 78: select_next_unrevealed_flag();  break;   /* n */
    }
});

function toggle_autoselect() {
    // If the board is not available, do nothing
    if (!gameboardCanvas.ready()) return;

    autoselect = !autoselect;
    $('#autoplay-indicator').css('visibility', (autoselect)? 'visible' : 'hidden');

    console.log('autoselect ' + (autoselect) ? 'on' : 'off');

    if (autoselect && gamestate.turn === gamestate.playingAs) {
        select_next_unrevealed_flag();
    }

    if (!autoselect) {
        // Hide select guides
        gameboardCanvas.forEach((i,j,tile) => tile.erase('guide'));
    }
}

// Scan through the board and reason about where flags must and must not be
function solverscan() {
    console.log('solverscan');
    var nfound_flag = 1;
    var nfound_noflag = 1;
  
    while (nfound_flag > 0 || nfound_noflag > 0) {
        nfound_flag = solver_flaghere();
        nfound_noflag = solver_noflag();
    }
}
  
function isnumbertile(tile) {
    //console.log(`(${tile.i},${tile.j}) = ${tile ? 'exists' : 'DNE'}/${tile.hidden}/${tile.value}`);
    return tile && !tile.hidden && [1,2,3,4,5,6,7,8].includes(tile.value);
}
  
// Return 1 if this tile is a revealed flag, 0 otherwise
function isflag(tile) {
    return tile && (tile.flaghere || PLAYER_FLAGS.includes(tile.value));
}

// Return 1 if this tile is hidden, 0 otherwise
// A flag- or noflag-labelled tile is considered revealed
function isunknown(tile) {
    //console.log(`(${tile.i},${tile.j}) = ${tile ? 'exists' : 'DNE'}/${tile.hidden}/${tile.noflag}/${tile.flaghere}`);
    return tile && tile.hidden && !tile.noflag && !tile.flaghere;
}

// Find where there must be a flag
function solver_flaghere() {
    console.log('solver_flaghere');
    // Number of hidden flags found 
    var nfound = 0;

    function highlight(i, j) {
        const gameTile = gamestate.board.at(i, j);
        const canvasCell = gameboardCanvas.at(i, j);

        // Ignore tiles with known values
        if (!isunknown(gameTile)) return;

        nfound++;
        gameTile.flaghere = true;
        canvasCell.draw('guide', 'FLAGHERE');
    }

    gamestate.board.forEach(function(i,j,tile) {
        // Consider only revealed number tiles
        if (!isnumbertile(tile)) return;

        //console.log(`Looking for flags around (${tile.i},${tile.j}) = ${tile.value}${tile.hidden? 'h' : ''}`);
        // A noflag tile never becomes a flaghere tile, and vice versa

        const adjacent = gamestate.board.adjacent(i,j);

        const adjacentflags = adjacent.filter(isflag).length;
        const remainingflags = tile.value - adjacentflags;
        const adjacenthidden = adjacent.filter(isunknown).length;

        // Same number of unrevealed + noflag tiles as remaining flags
        if (remainingflags > 0 && remainingflags === adjacenthidden) {
            adjacent.forEach(nb => highlight(nb.i, nb.j));
        }
    });

    console.log(`Found ${nfound} flags`);

    return nfound;
}


// Find where there cannot be a flag
function solver_noflag() {
    console.log('solver_noflag');

    // Number of hidden no-flags found
    var nfound = 0;

    function crossout(i,j) {
        const gameTile = gamestate.board.at(i, j);
        const canvasCell = gameboardCanvas.at(i, j);

        // Ignore tiles with known values
        if (!isunknown(gameTile)) return;

        nfound++;
        gameTile.noflag = true;
        canvasCell.draw('guide', 'NOFLAG');
    }

    gamestate.board.forEach(function(i,j,tile) {
        // Consider only revealed number tiles
        if (!isnumbertile(tile)) return;

        // Array of adjacent tiles
        const adjacent = gamestate.board.adjacent(i,j);

        // A noflag tile never becomes a flaghere tile, and vice versa

        const num_adjacentflags = adjacent.filter(isflag).length;
        const num_remainingflags = tile.value - num_adjacentflags;

        // Same number of unrevealed + noflag tiles as remaining flags
        if (num_remainingflags === 0)
            adjacent.forEach(nb => crossout(nb.i, nb.j));
    });

    console.log(`Found ${nfound} non-flags`);

    return nfound;
}
 
function select_next_unrevealed_flag() {
    console.log('select_next_unrevealed_flag');
    var selected = false;
    // Good reason to replace .forEach() with .tiles() which returns array
    gamestate.board.forEach(function(i,j,tile) {
        if (!selected && tile.hidden && tile.flaghere) {
            selected = true;
            selectTile(i, j, gamestate, socket);
        }
    });

    if (!selected) {
        selectRandomTile(gamestate, socket);
    }
}