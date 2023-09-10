require('dotenv').config();

const WebSocketServer = require('./websocket-server.js');
const MatchManager = require('./match-manager.js')

const {
    WSS_PORT,
    SSL_CERT,
    SSL_KEY,
    BOARD_NUM_ROWS,
    BOARD_NUM_COLUMNS,
    BOARD_NUM_FLAGS,
    WINNING_SCORE
} = process.env;

const manager = MatchManager({
    n : BOARD_NUM_ROWS,
    m : BOARD_NUM_COLUMNS,
    f : BOARD_NUM_FLAGS,
    w : WINNING_SCORE
});

// Start up a server...
WebSocketServer({
    port               : WSS_PORT,
    cert               : SSL_CERT,
    key                : SSL_KEY,
    onClientConnect    : manager.onClientConnect,
    onClientMessage    : manager.onClientMessage,
    onClientDisconnect : manager.onClientDisconnect,
});