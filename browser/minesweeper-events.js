// Event handlers for canvas clicks and server messages
// Model-View-[Controller]


//
// WebSocket Messaging

const HIDDEN_MINE = '*';
const PLAYER_FLAGS = ['A', 'B'];

const SERVER_ADDRESS = 'wss://marinm.net/wss/minesweeper';

var gamestate = { player: null, turn: null };
var play_sounds = false;

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

      if (PLAYER_FLAGS.includes(item.value)) {
        playsound('ding');
      }
      else {
        playsound('dop');
      }
      
      $('#player-0-score').text(revealed.score[0]);
      $('#player-1-score').text(revealed.score[1]);

      if (revealed.turn === 0) {
        $('#player-0-score-box').addClass('active-turn');
        $('#player-1-score-box').removeClass('active-turn');
      }
      else {
        $('#player-0-score-box').removeClass('active-turn');
        $('#player-1-score-box').addClass('active-turn');
      }

      // Game is over
      if (!revealed.on) {
        const player_box = (revealed.turn === 0)
                         ? $('#player-0-score-box')
                         : $('#player-1-score-box');
        player_box.toggleClass('active-turn score-box-winner');
      }
    });
  },
};

function report_click(tiles, i, j) {
  if (gamestate.turn != gamestate.player) {
    // Player out of turn
    // Do nothing ...
  }
  else {
    socket.send( messages.select(i, j) );
  }
};

const sounds = {
  'dop' : $('#dop-sound').get()[0],
  'ding' : $('#ding-sound').get()[0],
}

function playsound(name) {
  if (!play_sounds) {
    return;
  }
  const sound = sounds[name];
  if (!sound) {
    return;
  }
  sound.play();
}

$('#sounds-button').click(function() {
  play_sounds = !play_sounds;
  const src = (play_sounds)? 'volume-2.svg' : 'volume-x.svg';
  $('#sounds-icon').attr('src', src);
});