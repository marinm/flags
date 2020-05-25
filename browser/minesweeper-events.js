// Event handlers for canvas clicks and server messages
// Model-View-[Controller]


//
// WebSocket Messaging

const SERVER_ADDRESS = 'wss://marinm.net/wss/minesweeper';

function wss_connect(address) {
  try {
    return new WebSocket(address);
  }
  catch (err) {
    return null;
  }
}

const socket = wss_connect(SERVER_ADDRESS);
var heartbeat = null;

if (socket === null) {
  console.log('Failed connection');
}
else {
  socket.addEventListener('open', connection_opened);
  socket.addEventListener('message', receive_message);
  socket.addEventListener('close', connection_closed);
}

function websocket_error(err) {
  console.log(err);
}

function connection_opened() {
  console.log('connection opened');
  
  // Every 30 seconds, 
  heartbeat = setInterval(function() {
    socket.send(JSON.stringify({action: 'HEARTBEAT'}));
  }, 30000);
}

function receive_message(event) {
  const msg = JSON.parse(event.data);
  if (msg.online === 0)
    $('#online-indicator').css('color', '#cccccc');
  else
    $('#online-indicator').css('color', '#00ff00');

  $('#online-count').text(' ' + msg.online + ' online');
}

function connection_closed(event) {
  clearInterval(heartbeat);
  console.log('Connection closed');
}


// Callbacks

function report_click(tiles, i, j) {

  return new Promise(function(resolve, reject) {
    const revealed = game.select(i, j);
    if (!revealed) {
      // ... do something here
      // out-of-bounds or game already over
      resolve(revealed);
    }

    revealed.show.forEach(function(item) {
      var value = item.value;
      if (value === MINE_MARK) {
        value = (revealed.turn === 0)
              ? 'PLAYER_FLAG_0'
              : 'PLAYER_FLAG_1';
      }
      tiles.setvalue(item.i, item.j, value);

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
    resolve(revealed);
  });
};