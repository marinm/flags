// A WebSockets server

require('dotenv').config()

const fs = require('fs')
const https = require('https')
const WebSocket = require('ws')

const SERVER_PORT = 9999
const PING_INTERVAL = 30 * 1000

const server = https.createServer({
  cert: fs.readFileSync(process.env.SSL_CERT),
  key: fs.readFileSync(process.env.SSL_KEY)
});
const wss = new WebSocket.Server({ server });

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

wss.on('connection', new_session);
wss.on('close', shutdown_server);

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
	ws.on('message', console.log);

  // Client connection closed
  ws.on('close', close);

  broadcast_online_count();
}

function broadcast_online_count() {
  const online = wss.clients.size;
  broadcast({ online });
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

function close() {
  clearInterval(ping_interval);
  console.log('server stopped hearing from client');
  broadcast_online_count();
}

server.listen(SERVER_PORT);