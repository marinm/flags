const dotenv = require('dotenv');
const SimpleWebSockets = require('./simple-websockets.js');
const FlagsGame = require('./game.js')

dotenv.config();

SimpleWebSockets({
    port               : process.env.WSS_PORT,
    cert               : process.env.SSL_CERT,
    key                : process.env.SSL_KEY,
    onClientConnect    : onClientConnect,
    onClientMessage    : onClientMessage,
    onClientDisconnect : onClientDisconnect,
});

// -----------------------------------------------------------------------------

const TMP_N = 24;
const TMP_M = 24;
const TMP_R = Math.floor((TMP_N + TMP_M) * 2);

var game = FlagsGame(TMP_N, TMP_M, TMP_R);

// WebSocket clients
var PLAYER_A = null;
var PLAYER_B = null;


function onClientConnect(connection) {

    console.log(`New connection (${connection})`);

    if (PLAYER_A === null) {
        PLAYER_A = connection;
        connection.send(JSON.stringify({ type: 'join', status: 'OPEN', playing_as: 0 }));
    }
    else if (PLAYER_B === null) {
        PLAYER_B = connection;
        connection.send(JSON.stringify({ type: 'join', status: 'OPEN', playing_as: 1 }));

        console.log(`Game starts: ${PLAYER_A} vs ${PLAYER_B}`);

        PLAYER_A.send(JSON.stringify({ type: 'start' }));
        PLAYER_B.send(JSON.stringify({ type: 'start' }));
    }
    else {
        connection.send(JSON.stringify({ type: 'join', status: 'BUSY' }));
    }
}

function onClientDisconnect(connection) {
    // On disconnect, 
    // [0] Client was PLAYING_AS 'A' and waiting for 'B', end game
    // [1] Client was PLAYING_AS 'A', end game, TELL 'B'
    // [2] Client was PLAYING_AS 'B', end game, TELL 'A'
    // [3] Client was not playing, do nothing

    if (connection === PLAYER_A) {
        PLAYER_A = null;
        if (PLAYER_B != null) {
            PLAYER_B.send(JSON.stringify({ type: 'opponent-disconnected' }));
            // Also kick out the other player
            PLAYER_B = null;
        }
        // Start a new game
        game = FlagsGame(TMP_N, TMP_M, TMP_R);
    }
    else if (connection === PLAYER_B) {
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
}

function onClientMessage(connection, message) {
    // Ignore requests from non-players
    if (connection != PLAYER_A && connection != PLAYER_B) {
        console.log(`Request from non-player (${connection}): ${JSON.stringify(message)}`);
        return;
    }

    //console.log(JSON.stringify(msg));
    switch (message.type) {
        case 'select': console.log('select'); handlers.select(connection, message); break;
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
            console.log('Player selects out of turn: ' + socket);
        }
    },
};

