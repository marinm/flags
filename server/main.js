// A WebSockets server

require('dotenv').config()

const fs = require('fs')
const https = require('https')
const WebSocket = require('ws')
const FlagsGame = require('./game.js')


const SERVER_PORT = process.env.WSS_PORT
const PING_INTERVAL = 30 * 1000

const TMP_N = 24;
const TMP_M = 24;
const TMP_R = Math.floor((TMP_N + TMP_M) * 2);
var game = FlagsGame(TMP_N, TMP_M, TMP_R);

// WebSocket clients
var PLAYER_A = null;
var PLAYER_B = null;

const server = https.createServer({
  cert: fs.readFileSync(process.env.SSL_CERT),
  key: fs.readFileSync(process.env.SSL_KEY)
});
const wss = new WebSocket.Server({ server });
wss.on('connection', new_session);
wss.on('close', shutdown_server);
server.listen(SERVER_PORT);

console.log('Secure WebSocket Server started');
console.log(`Listening for clients on ${SERVER_PORT}...`);

function heartbeat() {
  this.isAlive = true;
}

function ping() {
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false)
      return ws.terminate();
 
    ws.isAlive = false;
    ws.ping(function noop(){});
  });
}

// Every 30 seconds, ping all clients
const ping_interval = setInterval(ping, PING_INTERVAL);

function parse_json(message) {
	try {
		return JSON.parse(message);
	}
	catch (err) {
		return null;
	}
}

// When a new client connects
function new_session(ws) {

    console.log('new connection');

  ws.isAlive = true;
  ws.on('pong', heartbeat);

  // Received message from client
	ws.on('message', function(data) {
    receive(ws, parse_json(data));
  });

  // Client connection closed
  ws.on('close', function() {
    close(ws);
  });

  if (PLAYER_A === null) {
    PLAYER_A = ws;
    ws.send(JSON.stringify({ type: 'join', status: 'OPEN', playing_as: 0 }));
  }
  else if (PLAYER_B === null) {
    PLAYER_B = ws;
    ws.send(JSON.stringify({ type: 'join', status: 'OPEN', playing_as: 1 }));

    PLAYER_A.send(JSON.stringify({ type: 'start' }));
    PLAYER_B.send(JSON.stringify({ type: 'start' }));
  }
  else {
    ws.send(JSON.stringify({ type: 'join', status: 'BUSY' }));
  }
}

function close(ws) {
  // On disconnect, 
  // [1] Client was PLAYING_AS 'A' and waiting for 'B', end game
  // [1] Client was PLAYING_AS 'A', end game, TELL 'B'
  // [2] Client was PLAYING_AS 'B', end game, TELL 'A'
  // [3] Client was not playing, do nothing

  if (ws === PLAYER_A) {
    PLAYER_A = null;
    if (PLAYER_B != null) {
      PLAYER_B.send(JSON.stringify({ type: 'opponent-disconnected' }));
      // Also kick out the other player
      PLAYER_B = null;
    }
    // Start a new game
    game = FlagsGame(TMP_N, TMP_M, TMP_R);
  }
  else if (ws === PLAYER_B) {
    PLAYER_B = null;
    if (PLAYER_A != null) {
      PLAYER_A.send(JSON.stringify({ type: 'opponent-disconnected' }));
      // Also kick out the other player
      PLAYER_A = null;
    }
    // Start a new game
    game = FlagsGame(TMP_N, TMP_M, TMP_R);
  }
  else {
    // notify a waiting player
    // or broadcast to all waiting players
  }

  clearInterval(ping_interval);
  console.log('server stopped hearing from client');
  // Will need again later...
  // broadcast_online_count();
}

function broadcast_online_count() {
  const online = wss.clients.size;
  broadcast({ type: 'online', online });
}

// The WebSocket server closes
function shutdown_server() {
  clear_interval(ping_interval)
}

function broadcast(msg) {
	wss.clients.forEach(function(ws) {
		ws.send(JSON.stringify(msg));
	});
}

function receive(socket, msg) {
  // Ignore requests from non-players
  if (socket != PLAYER_A && socket != PLAYER_B) {
    console.log('Request from non-player: ', JSON.stringify(msg));
    return;
  }

  console.log(JSON.stringify(msg));
  switch (msg.type) {
    case 'select': console.log('select'); handlers.select(socket, msg); break;
    default: ; // do something...
  }
}

const handlers = {
  'select':
  function(socket, msg) {
    const gamestate = game.getstate();

    const A_selects = (socket === PLAYER_A && gamestate.turn === 0);
    const B_selects = (socket === PLAYER_B && gamestate.turn === 1);

    if (A_selects || B_selects) {
      var response = game.select(msg.i, msg.j);
      response.type = 'reveal';
      response.for = {i: msg.i, j: msg.j};
      PLAYER_A.send( JSON.stringify(response) );
      PLAYER_B.send( JSON.stringify(response) );
    }
    else {
      // Player selects out of turn
      // Do nothing
      // Client should avoid this situation
      console.log('Player selects out of turn');
    }
  },
};

