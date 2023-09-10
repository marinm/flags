const { randomUUID } = require('node:crypto');

const handle_version = require('./handle-version.js');
const handle_join = require('./handle-join.js');
const handle_select = require('./handle-select');

const Match = require('./match.js');

module.exports =
function MatchManager( {n,m,f,w} ) {

    let match = {
        playerA  : null,
        playerB  : null,
        id       : null,
        match    : null,
    };

    const handlers = {
        'version' : handle_version(),
        'join'    : handle_join(match),
        'select'  : handle_select(match),
    };

    function new_game() {
        match.playerA = null;
        match.playerB = null;
        match.id      = randomUUID();
        match.match   = Match(n, m, f, w);

        return null;
    }

    new_game();

    return {
        onSocketOpen:
        function(connection) {
            console.log(`New connection (${connection})`);

            // Need a server version scheme...
            connection.send({type: 'version', version: 'hola'});
        },

        onSocketClose:
        function(connection) {
            // On disconnect, 
            // [0] Client was PLAYING_AS 'A' and waiting for 'B', end game
            // [1] Client was PLAYING_AS 'A', end game, TELL 'B'
            // [2] Client was PLAYING_AS 'B', end game, TELL 'A'
            // [3] Client was not playing, do nothing
        
            if (connection === match.playerA) {
                match.playerA = null;
                if (match.playerB != null) {
                    match.playerB.send({ type: 'opponent-disconnected' });
                    // Also kick out the other player
                    match.playerB = null;
                }
                new_game();
                return null;

                // notify a waiting player?
            }

            if (connection === match.playerB) {
                match.playerB = null;
                if (match.playerA != null) {
                    match.playerA.send({ type: 'opponent-disconnected' });
                    // Also kick out the other player
                    match.playerA = null;
                }
                new_game();
                return null;

                // notify a waiting player?
            }

            // Client wasn't an active player. Do nothing.
            return null;
        },

        onSocketMessage:
        function(connection, message) {
            // If the message type does not map to a function in the handlers
            // dict, then drop this message.
            handlers[message.type]?.(connection, message);
        }
    }
}