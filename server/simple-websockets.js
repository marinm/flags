const fs = require('fs');
const https = require('https');
const ws = require('ws');

const PING_INTERVAL = 30 * 1000

function parse_json(message) {
    try {
        return JSON.parse(message);
    }
    catch (err) {
        return null;
    }
}

function pingAll(serverWSS) {
    serverWSS.clients.forEach(
        function each(connection) {
            if (connection.isAlive === false)
                return ws.terminate();

            connection.isAlive = false;
            connection.ping(function noop(){});
        }
    );
}

// function broadcast(serverWSS, msg) {
// 	    serverWSS.clients.forEach(function(ws) {
// 		    ws.send(JSON.stringify(msg));
// 	    });
// }

// function broadcast_online_count() {
//     const online = wss.clients.size;
//     broadcast({ type: 'online', online });
// }

module.exports =
function SimpleWebSockets({
    port,
    cert,
    key,
    onClientConnect,
    onClientMessage,
    onClientDisconnect
}) {

    // Default handler: do nothing
    onClientConnect    = onClientConnect    || function noop() {};
    onClietMessage     = onClientMessage    || function noop() {};
    onClientDisconnect = onClientDisconnect || function noop() {};


    const serverHTTPS = https.createServer({
        cert : fs.readFileSync(cert),
        key  : fs.readFileSync(key)
    });

    const serverWSS = new ws.Server({server: serverHTTPS});

    // Temporary connectionID counter
    let seq = 0;

    serverWSS.on('connection', function(connection, request) {

        // Idea: Return a wrapper around the connection object with
        //      - method sendJSON()
        //      - property connectionID

        connection.isAlive = true;
        connection.id = seq++;

        console.log('SimpleWebSocketServer: a new client connected');
        onClientConnect(connection);

        connection.on('pong',
            function() {
                connection.isAlive = true;
            }
        );

        connection.on('message',
            function(data, isBinary) {
                const parsed = parse_json(data);
                
                // "Rude mode"
                // Ignore all messages that can't be parsed as JSON
                // The callback is guaranteed to receive a non-null object
                parsed ? onClientMessage(connection, parsed) : null;

                // It would also be helpful to reply to the client...
            }
        );

        connection.on('close',
            function(code, reason) {
                console.log('SimpleWebSocketServer: a client disconnected');
                // Will need again later...
                // broadcast_online_count();

                // Ignore the code/reason
                onClientDisconnect(connection);
            }
        );
    });


    serverWSS.on('close',
        function() {
            clear_interval(ping_interval);
        }
    );

    // Start listening...
    serverHTTPS.listen(port);
    console.log('Secure WebSocket Server started');
    console.log(`Listening for clients on ${port}...`);

    // Every 30 seconds, ping all clients
    const ping_interval = setInterval(() => pingAll(serverWSS), PING_INTERVAL);
}