const Match = require('./match.js');

module.exports =
function MatchManager( {n,m,f,w} ) {

    let match = Match(n, m, f, w);

    // WebSocket clients
    var PLAYER_A = null;
    var PLAYER_B = null;

    const handlers = {
        'version':
        function(connection, message) {
            // Need a server version scheme...
            connection.send({type: 'version', version: null});
            return null;
        },

        'join':
        function(connection, message) {

            if (PLAYER_A === null) {
                PLAYER_A = connection;
                connection.send({ type: 'join', status: 'OPEN', playing_as: 0 });
                return null;
            }

            if (PLAYER_B === null) {
                PLAYER_B = connection;
                connection.send({ type: 'join', status: 'OPEN', playing_as: 1 });
        
                console.log(`Game starts: ${PLAYER_A} vs ${PLAYER_B}`);
        
                PLAYER_A.send({ type: 'start' });
                PLAYER_B.send({ type: 'start' });
                return null;
            }

            connection.send({ type: 'join', status: 'BUSY' });
            return null;
        },

        'select':
        function(connection, message) {
            // Ignore requests from non-players
            if (connection != PLAYER_A && connection != PLAYER_B) {
                console.log(`Request from non-player (${connection.id}): ${JSON.stringify(message)}`);
                return null;
            }

            const gamestate = match.state();
    
            const A_selects = (connection.id === PLAYER_A.id && gamestate.turn === 0);
            const B_selects = (connection.id === PLAYER_B.id && gamestate.turn === 1);
    
            if (A_selects || B_selects) {
                const response = {
                    type : 'reveal',
                    for  : {i: message.i, j: message.j},
                    ...match.select(message.i, message.j)
                };
                PLAYER_A.send(response);
                PLAYER_B.send(response);
                return null;
            }

            // Player selects out of turn
            // Do nothing
            // Client should avoid this situation
            console.log('Player selects out of turn: ' + connection.id);
            return null;
        },
    };

    return {
        onClientConnect:
        function(connection) {
            console.log(`New connection (${connection})`);

            // Need a server version scheme...
            connection.send({type: 'version', version: null});
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
                match = Match(n, m, f, w);
                return null;

                // notify a waiting player?
            }

            if (connection === PLAYER_B) {
                PLAYER_B = null;
                if (PLAYER_A != null) {
                    PLAYER_A.send({ type: 'opponent-disconnected' });
                    // Also kick out the other player
                    PLAYER_A = null;
                }
                // Start a new game
                match = Match(n, m, f, w);
                return null;

                // notify a waiting player?
            }

            // Client wasn't an active player. Do nothing.
            return null;
        },

        onClientMessage:
        function(connection, message) {
            // If the message type does not map to a function in the handlers
            // dict, then drop this message.
            handlers[message.type]?.(connection, message);
        }
    }
}