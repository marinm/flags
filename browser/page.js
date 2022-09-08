// Event handlers for canvas clicks and server messages
// Model-View-[Controller]

import config from './config.js';
import {FlagsBoard, TILESHEET} from './flags-canvas.js';
import $ from './fake-jquery.js';
import QuickWebSocket from './quick-websocket.js';
import showStatus from './show-status.js';
import showTurn from './show-turn.js';

const {
    SERVER_ADDRESS,
    BOARD_NUM_ROWS,
    BOARD_NUM_COLUMNS,
    BOARD_CELL_SIZE,
    WINNING_SCORE,
    PLAYER_FLAGS,
} = config;



const gamestate = { player: null, turn: null };

// Set up the board
const board = new FlagsBoard(
    BOARD_NUM_ROWS,
    BOARD_NUM_COLUMNS,
    BOARD_CELL_SIZE,
    TILESHEET,
    report_click
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

// This is not necessary if an error event is also fired on fail
if (!socket) showStatus('disconnected', board);


function onError() {
    showStatus('disconnected', board);
}

function onOpen() {
    // Do nothing...?
}

function onClose() {
    showStatus('disconnected', board);
}

function onMessage(quicksocket, message) {
    // If the event/message type is not recognized, discard/ignore it
    if (!Object.keys(handlers).includes(message.type)) return;
  
    // call the appropriate handler
    handlers[message.type](message, board, gamestate);
}


//------------------------------------------------------------------------------

let autoselect = false;

$('#board-container').append(board.canvas);

$('.remaining').text(' / ' + WINNING_SCORE);



document.addEventListener("keyup", function(event) {
  switch (event.keyCode) {
    case 65: toggle_autoselect();            break;   /* a */
    case 71: solverscan();                   break;   /* g */
    case 78: select_next_unrevealed_flag();  break;   /* n */
  }
});


// Callbacks

const messages = {
    select:
    function(i, j) {
        return { type: 'select', i, j };
    },
};

const handlers = {
    online:
    function(message) {
        // unused
    },

    join:
    function(message) {
        if (message.status === 'OPEN') {
            gamestate.player = message.playing_as;
            gamestate.turn = 0;
            showStatus('waiting', board); // wait for the game-start message

            if (Number(gamestate.player) === 0) {
                $('#player-0-score-box').addClass('playing-as');
            }
            else if (Number(gamestate.player) === 1) {
                $('#player-1-score-box').addClass('playing-as');
            }
        }
        else {
            showStatus('busy', board); // nobody to play with...
        }
    },

    start:
    function(message) {
        showStatus('start', board);

        $('#player-0-score-box').addClass('active-turn');
        $('#turn-score-container').removeClass('not-playing');

        showTurn(gamestate, board);
    },

  'opponent-disconnected':
    function(message) {
        showStatus('opponent-disconnected', board);
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
            board.setvalue(item.i, item.j, item.value, item.owner);
            board.tile(item.i, item.j).erase('guide');
        });

        const selected = message.for;
        board.select(selected.i, selected.j);

        showScores(revealed.score);

        // The game is still on
        if (revealed.on) {
            showTurn(gamestate, board);

            if (autoselect) {
                // React even if it's the opponent's turn
                solverscan();
                if (gamestate.turn === gamestate.player) {
                    // Select either a known,hidden flag or a random tile
                    select_next_unrevealed_flag();
                }
            }
        }
        // Game is over
        else {
            showWinner(revealed.turn);
        }
    },
};

function showScores(scores) {
    $('#player-0-score').text(scores[0]);
    $('#player-1-score').text(scores[1]);
}

// Show that the game is over and highlight who won the game
function showWinner(player) {
    // Highlight winner in the score box
    const player_box = (player === 0)
        ? $('#player-0-score-box')
        : $('#player-1-score-box');
    player_box.toggleClass('active-turn');
    player_box.toggleClass('score-box-winner');

    $('#whose-turn').text('Winner!');

    showStatus('winner', board);
}

// Selecting a tile is a network event, though it presents like a GUI event
// A tile is selected after the server has ACK'ed and approved the select REQ
function select_tile(i, j) {
    if (gamestate.turn === gamestate.player) {
        socket.send( messages.select(i, j) );
    }
}

function report_click(tiles, i, j) {
  if (gamestate.turn != gamestate.player) {
    // Player out of turn
    // Do nothing ...
  }
  else if (board.tile(i,j).hidden === false) {
    // Clicked on already revealed tile
    // Do nothing ...
  }
  else {
    select_tile(i, j);
    // A clicked tile is not displayed as selected until the server confirms the selection
  }
};

function toggle_autoselect() {
  // If the board is not available, do nothing
  if (! board.ready())
    return;

  autoselect = !autoselect;
  $('#autoplay-indicator').css('visibility', (autoselect)? 'visible' : 'hidden');

  if (autoselect && gamestate.turn === gamestate.player) {
    select_next_unrevealed_flag();
  }

  if (!autoselect) {
    // Hide select guides
    board.forEachTile(function(i,j) {
      board.tile(i,j).erase('guide');
    });
  }
}



//------------------------------------------------------------------------------
// Solver
function randint(min, max) {
    // Return a random integer from [min...max-1]
    return Math.floor(Math.random() * (max - min) ) + min;
}  

function select_random_tile() {
    var i = 0;
    var j = 0;
    var tile = null;
    do {
      i = randint(0, board.N);
      j = randint(0, board.M);
      tile = board.tile(i,j);
    }
    while (!tile.hidden || (tile.hidden && tile.noflag));
    // Repeat if tile is already revealed,
    // or if it's hidden but it's known not to be a flag
  
    select_tile(i,j);
  }

// Scan through the board and reason about where flags must and must not be
function solverscan() {
    var nfound_flag = 1;
    var nfound_noflag = 1;
  
    while (nfound_flag > 0 || nfound_noflag > 0) {
      nfound_flag = solver_flaghere();
      nfound_noflag = solver_noflag();
    }
  }
  
  function isnumbertile(tile) {
    return tile && !tile.hidden && [1,2,3,4,5,6,7,8].includes(tile.value);
  }
  
  // Return 1 if this tile is a revealed flag, 0 otherwise
  function isflag(tile) {
    return tile && (tile.flaghere || PLAYER_FLAGS.includes(tile.value));
  }
  
  // Return 1 if this tile is hidden, 0 otherwise
  // A flag- or noflag-labelled tile is considered revealed
  function isunknown(tile) {
    return tile && tile.hidden && !tile.noflag && !tile.flaghere;
  }
  
  
  // Find where there must be a flag
  function solver_flaghere() {
    // Number of hidden flags found 
    var nfound = 0;
  
    board.forEachTile(function(i,j) {
      // Consider only revealed number tiles
      if (!isnumbertile(board.tile(i,j)))
        return;
  
      // Array of adjacent tiles
      const adjacent = board.tile(i,j).adjacent();
  
      function highlight(tile) {
        if (isunknown(tile)) {
          nfound++;
          tile.flaghere = true;
          tile.draw('guide', 'FLAGHERE');
        }
      }
  
      // A noflag tile never becomes a flaghere tile, and vice versa
  
      const adjacentflags = adjacent.filter(isflag).length;
      const remainingflags = board.tile(i,j).value - adjacentflags;
      const adjacenthidden = adjacent.filter(isunknown).length;
  
      // Same number of unrevealed + noflag tiles as remaining flags
      if (remainingflags > 0 && remainingflags === adjacenthidden) {
        adjacent.forEach(highlight);
      }
    });
  
    return nfound;
  }
  
  
  // Find where there cannot be a flag
  function solver_noflag() {
    // Number of hidden no-flags found
    var nfound = 0;
  
    board.forEachTile(function(i,j) {
      // Consider only revealed number tiles
      if (!isnumbertile(board.tile(i,j)))
        return;
  
      // Array of adjacent tiles
      const adjacent = board.tile(i,j).adjacent();
  
      function crossout(tile) {
        if (isunknown(tile)) {
          nfound++;
          tile.noflag = true;
          tile.draw('guide', 'NOFLAG');
        }
      }
  
      // A noflag tile never becomes a flaghere tile, and vice versa
  
      const adjacentflags = adjacent.filter(isflag).length;
      const remainingflags = board.tile(i,j).value - adjacentflags;
      const adjacenthidden = adjacent.filter(isunknown).length;
  
      // Same number of unrevealed + noflag tiles as remaining flags
      if (remainingflags === 0) {
        adjacent.forEach(crossout);
      }
    });
  
    return nfound;
  }
  
  
  function select_next_unrevealed_flag() {
    var selected = false;
    // Good reason to replace .forEachTile() with .tiles() which returns array
    board.forEachTile(function(i,j) {
      const tile = board.tile(i,j);
      if (!selected && tile.hidden && tile.flaghere) {
        selected = true;
        select_tile(i,j);
      }
    });
  
    if (!selected) {
      select_random_tile();
    }
  }