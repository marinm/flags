// A WebSockets server

require('dotenv').config()

const fs = require('fs')
const https = require('https')
const WebSocket = require('ws')
const MinesweeperGame = require('./minesweeper-game.js')


const SERVER_PORT = 9999
const PING_INTERVAL = 30 * 1000

const TMP_N = 24;
const TMP_M = 24;
const TMP_R = Math.floor((TMP_N + TMP_M) * 2);
const game = MinesweeperGame(TMP_N, TMP_M, TMP_R);


const server = https.createServer({
  cert: fs.readFileSync(process.env.SSL_CERT),
  key: fs.readFileSync(process.env.SSL_KEY)
});
const wss = new WebSocket.Server({ server });
wss.on('connection', new_session);
wss.on('close', shutdown_server);
server.listen(SERVER_PORT);

console.log('Secure WebSocket Server started')

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

  ws.isAlive = true;
  ws.on('pong', heartbeat);

  // Received message from client
	ws.on('message', function(data) {
    receive(ws, parse_json(data));
  });

  // Client connection closed
  ws.on('close', close);

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
  console.log(JSON.stringify(msg));
  switch (msg.type) {
    case 'select': console.log('select'); handlers.select(socket, msg); break;
    default: ; // do something...
  }
}

const handlers = {
  'select':
  function(socket, msg) {
    console.log('received a select request');
    var response = game.select(msg.i, msg.j);
    response.type = 'reveal';
    //socket.send(JSON.stringify(response));
    broadcast(response);
  },
};

function close() {
  clearInterval(ping_interval);
  console.log('server stopped hearing from client');
  // Will need again later...
  // broadcast_online_count();
}