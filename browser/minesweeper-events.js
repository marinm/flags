// Event handlers for canvas clicks and server messages
// Model-View-[Controller]


//
// WebSocket Messaging

const HIDDEN_MINE = '*';
const PLAYER_FLAGS = ['A', 'B'];

const SERVER_ADDRESS = 'wss://marinm.net/wss/minesweeper';

var gamestate = { player: null, turn: null };

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
      board.tile(item.i, item.j).erase('noflag');
      board.tile(item.i, item.j).erase('flaghere');
    });

    const selected = msg.for;
    board.select(selected.i, selected.j);

    showscores(revealed.score);

    var nfound_flag = 1;
    var nfound_noflag = 1;

    while (nfound_flag > 0 || nfound_noflag > 0) {
      nfound_flag = solver_flaghere();
      nfound_noflag = solver_noflag();
    }

    // The game is still on
    if (revealed.on) {
      showturn(revealed.turn);
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
  if (player === 0) {
    $('#player-0-score-box').addClass('active-turn');
    $('#player-1-score-box').removeClass('active-turn');
  }
  else {
    $('#player-0-score-box').removeClass('active-turn');
    $('#player-1-score-box').addClass('active-turn');
  }
}

// Show that the game is over and highlight who won the game
function showwinner(player) {
  // Highlight winner in the score box
  const player_box = (player === 0)
      ? $('#player-0-score-box')
      : $('#player-1-score-box');
  player_box.toggleClass('active-turn score-box-winner');

  showwinner(player);
  show_note('winner');
  board.showdisabled();
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
    socket.send( messages.select(i, j) );

    // A clicked tile is not displayed as selected until the server confirms the selection
  }
};


// Find where there must be a flag
function solver_flaghere() {
  // Number of hidden flags found 
  var nfound = 0;

  board.forEachTile(function(i,j) {
    // Consider only revealed number tiles
    if (board.tile(i,j).hidden || ![1,2,3,4,5,6,7,8].includes(board.tile(i,j).value))
      return;

    //  Top/Centre/Bottom - Left/Centre/Right
    //
    //    T      TL TC TR
    //  L C R    CL CC CR
    //    B      BL BC BR

    const TL = board.tile(i - 1, j - 1);
    const TC = board.tile(i - 1, j - 0);
    const TR = board.tile(i - 1, j + 1);
    const CL = board.tile(i - 0, j - 1);
    const CR = board.tile(i - 0, j + 1);
    const BL = board.tile(i + 1, j - 1);
    const BC = board.tile(i + 1, j - 0);
    const BR = board.tile(i + 1, j + 1);

    const adjacent = [TL, TC, TR, CL, CR, BL, BC, BR];

    // Return 1 if this tile is a revealed flag, 0 otherwise
    function isflag(tile) {
      return tile && (tile.flaghere || PLAYER_FLAGS.includes(tile.value));
    }

    // Return 1 if this tile is hidden, 0 otherwise
    // A flag- or noflag-labelled tile is considered revealed
    function ishidden(tile) {
      return tile && tile.hidden && !tile.noflag && !tile.flaghere;
    }

    function highlight(tile) {
      if (ishidden(tile)) {
        nfound++;
        tile.flaghere = true;
        tile.draw('flaghere', 'FLAGHERE');
      }
    }

    // A noflag tile never becomes a flaghere tile, and vice versa

    const adjacentflags = adjacent.filter(isflag).length;
    const remainingflags = board.tile(i,j).value - adjacentflags;
    const adjacenthidden = adjacent.filter(ishidden).length;

    // Same number of unrevealed + noflag tiles as remaining flags
    if (remainingflags > 0 && remainingflags === adjacenthidden) {
      highlight(TL);
      highlight(TC);
      highlight(TR);
      highlight(CL);
      highlight(CR);
      highlight(BL);
      highlight(BC);
      highlight(BR);
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
    if (board.tile(i,j).hidden || ![1,2,3,4,5,6,7,8].includes(board.tile(i,j).value))
      return;

    //  Top/Centre/Bottom - Left/Centre/Right
    //
    //    T      TL TC TR
    //  L C R    CL CC CR
    //    B      BL BC BR

    const TL = board.tile(i - 1, j - 1);
    const TC = board.tile(i - 1, j - 0);
    const TR = board.tile(i - 1, j + 1);
    const CL = board.tile(i - 0, j - 1);
    const CR = board.tile(i - 0, j + 1);
    const BL = board.tile(i + 1, j - 1);
    const BC = board.tile(i + 1, j - 0);
    const BR = board.tile(i + 1, j + 1);

    const adjacent = [TL, TC, TR, CL, CR, BL, BC, BR];

    // Return 1 if this tile is a revealed flag, 0 otherwise
    function isflag(tile) {
      return tile && (tile.flaghere || PLAYER_FLAGS.includes(tile.value));
    }

    // Return 1 if this tile is hidden, 0 otherwise
    // A flag- or noflag-labelled tile is considered revealed
    function ishidden(tile) {
      return tile && tile.hidden && !tile.noflag && !tile.flaghere;
    }

    function crossout(tile) {
      if (ishidden(tile)) {
        nfound++;
        tile.noflag = true;
        tile.draw('noflag', 'NOFLAG');
      }
    }

    // A noflag tile never becomes a flaghere tile, and vice versa

    const adjacentflags = adjacent.filter(isflag).length;
    const remainingflags = board.tile(i,j).value - adjacentflags;
    const adjacenthidden = adjacent.filter(ishidden).length;

    // Same number of unrevealed + noflag tiles as remaining flags
    if (remainingflags === 0) {
      crossout(TL);
      crossout(TC);
      crossout(TR);
      crossout(CL);
      crossout(CR);
      crossout(BL);
      crossout(BC);
      crossout(BR);
    }
  });

  return nfound;
}