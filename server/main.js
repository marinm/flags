const dotenv = require('dotenv');
const SimpleWebSockets = require('./simple-websockets.js');
const GameManager = require('./game-manager.js')

dotenv.config();

const { WSS_PORT, SSL_CERT, SSL_KEY } = process.env;

const manager = GameManager();

// Open a WebSocket server and start listening...
SimpleWebSockets({
    port               : WSS_PORT,
    cert               : SSL_CERT,
    key                : SSL_KEY,
    onClientConnect    : manager.onClientConnect,
    onClientMessage    : manager.onClientMessage,
    onClientDisconnect : manager.onClientDisconnect,
});