const Match = require('./match.js');

module.exports =
function MatchManager( {n,m,f,w} ) {

    let match = Match(n, m, f, w);

    // WebSocket clients
    var PLAYER_A = null;
    var PLAYER_B = null;

    const handlers = {
        'select':
        function(socket, msg) {
            const gamestate = match.state();
    
            const A_selects = (socket.id === PLAYER_A.id && gamestate.turn === 0);
            const B_selects = (socket.id === PLAYER_B.id && gamestate.turn === 1);
    
            if (A_selects || B_selects) {
                var response = match.select(msg.i, msg.j);
                response.type = 'reveal';
                response.for = {i: msg.i, j: msg.j};
                PLAYER_A.send(response);
                PLAYER_B.send(response);
            }
            else {
                // Player selects out of turn
                // Do nothing
                // Client should avoid this situation
                console.log('Player selects out of turn: ' + socket);
            }
        },
    };

    return {
        onClientConnect:
        function(connection) {

            console.log(`New connection (${connection})`);
        
            if (PLAYER_A === null) {
                PLAYER_A = connection;
                connection.send({ type: 'join', status: 'OPEN', playing_as: 0 });
            }
            else if (PLAYER_B === null) {
                PLAYER_B = connection;
                connection.send({ type: 'join', status: 'OPEN', playing_as: 1 });
        
                console.log(`Game starts: ${PLAYER_A} vs ${PLAYER_B}`);
        
                PLAYER_A.send({ type: 'start' });
                PLAYER_B.send({ type: 'start' });
            }
            else {
                connection.send({ type: 'join', status: 'BUSY' });
            }
        },

        onClientDisconnect:
        function(connection) {
            // On disconnect, 
            // [0] Client was PLAYING_AS 'A' and waiting for 'B', end game
            // [1] Client was PLAYING_AS 'A', end game, TELL 'B'
            // [2] Client was PLAYING_AS 'B', end game, TELL 'A'
            // [3] Client was not playing, do nothing
        
            if (connection === PLAYER_A) {
                PLAYER_A = null;
                if (PLAYER_B != null) {
                    PLAYER_B.send({ type: 'opponent-disconnected' });
                    // Also kick out the other player
                    PLAYER_B = null;
                }
                // Start a new game
                match = FlagsGame(n, m, f, w);
            }
            else if (connection === PLAYER_B) {
                PLAYER_B = null;
                if (PLAYER_A != null) {
                    PLAYER_A.send({ type: 'opponent-disconnected' });
                    // Also kick out the other player
                    PLAYER_A = null;
                }
                // Start a new game
                match = FlagsGame(n, m, f, w);
            }
            else {
                // notify a waiting player
                // or broadcast to all waiting players
            }
        },

        onClientMessage:
        function(connection, message) {
            // Ignore requests from non-players
            if (connection != PLAYER_A && connection != PLAYER_B) {
                console.log(`Request from non-player (${connection}): ${JSON.stringify(message)}`);
                return;
            }
        
            //console.log(JSON.stringify(msg));
            switch (message.type) {
                case 'select': handlers.select(connection, message); break;
                default: ; // do something...
            }
        }
    }
}