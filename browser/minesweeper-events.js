// Event handlers for canvas clicks and server messages
// Model-View-[Controller]


//
// WebSocket Messaging

const HIDDEN_MINE = '*';
const PLAYER_FLAGS = ['A', 'B'];
const KEYCODES = {'g': 71, 'n': 78};

const SERVER_ADDRESS = 'wss://marinm.net/wss/minesweeper';

var gamestate = { player: null, turn: null };
var autoplay = false;
var guides = false;

document.addEventListener("keyup", function(event) {
  console.log(event.keyCode);
  switch (event.keyCode) {
    case 65: toggle_autoplay();              break;   /* a */
    case 71: toggle_guides();                break;   /* g */
    case 78: select_next_unrevealed_flag();  break;   /* n */
  }
});


function wss_connect(address) {
  try {
    // The connection may fail for several reasons other than SECURITY_ERR but
    // will never throw any other error
    return new WebSocket(address);
  }
  catch (err) {
    // SECURITY_ERR
    return null;
  }
}

const socket = wss_connect(SERVER_ADDRESS);
var heartbeat = null;

if (socket === null) {
  room.disconnected();
}
else {
  socket.addEventListener('open', connection_opened);
  socket.addEventListener('message', receive_message);
  socket.addEventListener('close', connection_closed);
  socket.addEventListener('error', websocket_error);
}

function websocket_error(err) {
  room.disconnected();
}

function connection_opened() {
  // Every 30 seconds, 
  heartbeat = setInterval(function() {
    socket.send(JSON.stringify({action: 'HEARTBEAT'}));
  }, 30000);
}

function receive_message(event) {
  const msg = JSON.parse(event.data);

  // If the event/message type is not recognized, discard/ignore it
  if (!Object.keys(handlers).includes(msg.type))
    return;

  // call the appropriate handler
  handlers[msg.type](msg);
}

function connection_closed(event) {
  clearInterval(heartbeat);
  console.log('Connection closed');
  room.disconnected();
}

function show_note(n) {
  $('#note-box').children().hide();
  $('#' + n).show();
}

// Change the view
const room = {
  disconnected:
  function() {
    show_note('note-box-disconnected');
    board.showdisabled();
    $('#turn-score-container').addClass('disconnected');
  },

  waiting:
  function() {
    show_note('note-box-waiting');
    board.showdisabled();
    $('#turn-score-container').addClass('waiting');
    // also disable other components...
  },

  start:
  function() {
    show_note('note-box-game-on');
    board.restart();
    $('#turn-score-container').removeClass('waiting');
    // also enable other components...
  },

  busy:
  function() {
    show_note('note-box-busy');
    board.showdisabled();
    // also disable other components...
  },

  opponent_disconnected:
  function() {
    show_note('note-box-opponent-disconnected');
    board.showdisabled();
    $('#turn-score-container').addClass('disconnected');
    // also disable other components...
  },
};


// Callbacks

const messages = {
  select:
  function(i, j) {
    return JSON.stringify({ type: 'select', i, j });
  },
};

const handlers = {
  online:
  function(msg) {
    // Will need again later...
    // $('#online-indicator').css('color', (msg.online === 0)? '#cccccc' : '#00ff00');
    // $('#online-count').text(' ' + msg.online + ' online');

    // onreceive:online
    // console.log(msg.online);
  },

  join:
  function(msg) {
    if (msg.status === 'OPEN') {
      gamestate.player = Number(msg.playing_as);
      gamestate.turn = 0;
      room.waiting(); // wait for the game-start message

      const you_box = (gamestate.player === 0)? $('#player-0-score-box') : $('#player-1-score-box');
      const opponent_box = (gamestate.player === 1)? $('#player-0-score-box') : $('#player-1-score-box');

      you_box.children('.playing-as').text('You');
      opponent_box.children('.playing-as').text('Opponent');
    }
    else {
      room.busy(); // nobody to play with...
    }
  },

  start:
  function(msg) {
    room.start();

    $('#turn-score-container').removeClass('not-playing');

    showturn(gamestate.turn);
  },

  'opponent-disconnected':
  function(msg) {
    room.opponent_disconnected();
  },

  reveal:
  function(msg) {
    const revealed = msg;
    if (!revealed) {
      // ... do something here
      // out-of-bounds or game already over
    }

    gamestate.turn = revealed.turn;

    revealed.show.forEach(function(item) {
      var value = item.value;
      board.setvalue(item.i, item.j, value);
      board.tile(item.i, item.j).erase('guide');
    });

    const selected = msg.for;
    board.select(selected.i, selected.j);

    showscores(revealed.score);

    // The game is still on
    if (revealed.on) {
      showturn(revealed.turn);

      if (guides) {
        // React even if it's the opponent's turn
        // Guides are on if autoplay is on
        solverscan();
        draw_guides();
        if (autoplay && gamestate.turn === gamestate.player) {
          // Select either a known,hidden flag or a random tile
          select_next_unrevealed_flag();
        }
      }
    }
    // Game is over
    else {
      showwinner(revealed.turn);
    }
  },
};

function showscores(scores) {
  $('#player-0-score').text(scores[0]);
  $('#player-1-score').text(scores[1]);
}

// Show whose turn it is in the score box
function showturn(player) {

  const current_player_box = (player === 0)? $('#player-0-score-box') : $('#player-1-score-box');
  const waiting_player_box = (player === 1)? $('#player-0-score-box') : $('#player-1-score-box');

  current_player_box.addClass('active-turn');
  waiting_player_box.removeClass('active-turn');

  current_player_box.children('.turn-label').text('TURN');
  waiting_player_box.children('.turn-label').text('');
}

// Show that the game is over and highlight who won the game
function showwinner(player) {

  const current_player_box = (player === 0)? $('#player-0-score-box') : $('#player-1-score-box');
  const waiting_player_box = (player === 1)? $('#player-0-score-box') : $('#player-1-score-box');

  current_player_box.addClass('score-box-winner');
  current_player_box.children('.turn-label').text('WINNER');

  show_note('note-box-game-over');

  board.showdisabled();
}

// Selecting a tile is a network event, though it presents like a GUI event
// A tile is selected after the server has ACK'ed and approved the select REQ
function select_tile(i, j) {
  if (gamestate.turn === gamestate.player) {
    socket.send( messages.select(i, j) );
  }
}

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


function report_click(tiles, i, j) {
  if (gamestate.turn != gamestate.player) {
    // Player out of turn
    $('#note-box').effect('shake', {distance: 5});
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

function toggle_autoplay() {
  // Do nothing if board is disabled
  if (board.isdisabled())
    return;

  autoplay = !autoplay;
  $('#autoplay-indicator').css('visibility', (autoplay)? 'visible' : 'hidden');

  if (autoplay) {
    // React even if it's the opponent's turn
    solverscan();
    draw_guides();
    if (gamestate.turn === gamestate.player) {
      // Select either a known,hidden flag or a random tile
      select_next_unrevealed_flag();
    }

    // Also toggle guides
    guides = !guides;
  }
  else {
    erase_guides();
  }
}

function erase_guides() {
  board.forEachTile(function(i,j) {
    board.tile(i,j).erase('guide');
  });
}

function draw_guides() {
  // Do nothing if board is disabled
  if (board.isdisabled())
    return;

  // Redraw all guide tiles
  erase_guides();

  board.forEachTile(function(i,j) {
    const tile = board.tile(i,j);

    // Guide labels (noflag,flaghere) linger from past scans
    // Only draw on unrevealed tiles
    if (!tile.hidden) {
      return;
    }

    // Draw the guides
    if (tile.noflag) {
      tile.draw('guide', 'NOFLAG');
    }
    if (tile.flaghere) {
      tile.draw('guide', 'FLAGHERE');
    }
  });
}

function toggle_guides() {
  // Do nothing if board is disabled or autoplay is on
  if (board.isdisabled() || autoplay)
    return;

  guides = !guides;

  if (guides) {
    solverscan();
    draw_guides();
  }
  else {
    erase_guides();
  }
}