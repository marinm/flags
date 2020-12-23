// Event handlers for canvas clicks and server messages
// Model-View-[Controller]


//
// WebSocket Messaging

const HIDDEN_MINE = '*';
const PLAYER_FLAGS = ['A', 'B'];
const KEYCODES = {'g': 71, 'n': 78};

var gamestate = { player: null, turn: null };
var autoselect = false;

document.addEventListener("keyup", function(event) {
  console.log(event.keyCode);
  switch (event.keyCode) {
    case 65: toggle_autoselect();            break;   /* a */
    case 71: solverscan();                   break;   /* g */
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


const notes = {
  'disconnected': {
    class: 'disconnected-status',
    text:  'Disconnected. Try refreshing the page.'
  },
  'waiting': {
    class: 'waiting-status',
    text:  'Waiting for another player to join...'
  },
  'start': {
    class: 'ready-status',
    text:  'The game is on!'
  },
  'busy': {
    class: 'busy-status',
    text:  'Someone else is playing right now...'
  },
  'opponent-disconnected': {
    class: 'opponent-disconnected-status',
    text:  'Your opponent disconnected.'
  },
  'winner': {
    class: 'winner-status',
    text:  'Game over!'
  },
  'your-turn': {
    class: 'your-turn-status',
    text: 'Your turn'
  },
  'opponents-turn': {
    class: 'opponents-turn-status',
    text: "Opponent's turn"
  }
}

function show_note(n) {
  $('#note-box').attr('class', notes[n].class);
  $('#note-box').text( notes[n].text );
}

// Change the view
const room = {
  disconnected:
  function() {
    show_note('disconnected');
    board.showdisabled();
  },

  waiting:
  function() {
    show_note('waiting');
    board.showdisabled();
    // also disable other components...
  },

  start:
  function() {
    show_note('start');
    board.restart();
    // also enable other components...
  },

  busy:
  function() {
    show_note('busy');
    board.showdisabled();
    // also disable other components...
  },

  opponent_disconnected:
  function() {
    show_note('opponent-disconnected');
    board.showdisabled();
    $('#turn-score-container').addClass('not-playing');
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
      gamestate.player = msg.playing_as;
      gamestate.turn = 0;
      room.waiting(); // wait for the game-start message

      if (Number(gamestate.player) === 0) {
        $('#player-0-score-box').addClass('playing-as');
      }
      else if (Number(gamestate.player) === 1) {
        $('#player-1-score-box').addClass('playing-as');
      }
    }
    else {
      room.busy(); // nobody to play with...
    }
  },

  start:
  function(msg) {
    room.start();

    $('#player-0-score-box').addClass('active-turn');
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
      showwinner(revealed.turn);
    }
  },

  "turn-timeout":
  function(msg) {
    gamestate.turn = msg.turn;
    showturn(msg.turn);
  }
};

function showscores(scores) {
  $('#player-0-score').text(scores[0]);
  $('#player-1-score').text(scores[1]);
}

// Show whose turn it is in the score box
function showturn(turn) {
  if (turn === 0) {
    $('#player-0-score-box').addClass('active-turn');
    $('#player-1-score-box').removeClass('active-turn');
  }
  else {
    $('#player-0-score-box').removeClass('active-turn');
    $('#player-1-score-box').addClass('active-turn');
  }

  show_note((gamestate.player === turn)? 'your-turn' : 'opponents-turn');
}

// Show that the game is over and highlight who won the game
function showwinner(player) {
  // Highlight winner in the score box
  const player_box = (player === 0)
      ? $('#player-0-score-box')
      : $('#player-1-score-box');
  player_box.toggleClass('active-turn score-box-winner');

  $('#whose-turn').text('Winner!');

  show_note('winner');
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