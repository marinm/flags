const dotenv = require('dotenv');
const SimpleWebSockets = require('./simple-websockets.js');
const GameManager = require('./game-manager.js')

dotenv.config();

const {
    WSS_PORT,
    SSL_CERT,
    SSL_KEY,
    BOARD_NUM_ROWS,
    BOARD_NUM_COLUMNS,
    BOARD_NUM_FLAGS
} = process.env;

const manager = GameManager({
    n : BOARD_NUM_ROWS,
    m : BOARD_NUM_COLUMNS,
    f : BOARD_NUM_FLAGS,
});

// Open a WebSocket server and start listening...
SimpleWebSockets({
    port               : WSS_PORT,
    cert               : SSL_CERT,
    key                : SSL_KEY,
    onClientConnect    : manager.onClientConnect,
    onClientMessage    : manager.onClientMessage,
    onClientDisconnect : manager.onClientDisconnect,
});