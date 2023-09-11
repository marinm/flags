const fs = require('fs');
const https = require('https');
const ws = require('ws');
const { fromJSON, toJSON } = require('./json.js');
const { v4: uuidv4 } = require('uuid');

const PING_INTERVAL = 30 * 1000

function pingAll(server) {
    server.clients.forEach(socket => {
        if (!socket.isAlive) return socket.terminate();

        socket.isAlive = false;
        socket.ping();
    });
}

module.exports =
function JsonWebSocketServer({
    port,
    cert,
    key,
    onServerOpen,
    onServerClose,
    onSocketOpen,
    onSocketMessage,
    onSocketClose,
}) {

    // Default handlers do nothing
    onSocketOpen     = onSocketOpen    || (() => {});
    onSocketMessage  = onSocketMessage || (() => {});
    onSocketClose    = onSocketClose   || (() => {});

    const serverHTTPS = https.createServer({
        cert : fs.readFileSync(cert),
        key  : fs.readFileSync(key)
    });

    const serverWSS = new ws.Server({server: serverHTTPS});

    serverWSS.on('connection', function(socket, request) {

        socket.isAlive = true;

        const simpleSocket = {
            id: uuidv4(),
            send: (message) => {if (toJSON(message)) socket.send(toJSON(message));}
        }

        onSocketOpen(simpleSocket);

        socket.on('pong', () => socket.isAlive = true);

        socket.on('message',
            function(message, isBinary) {
                if (fromJSON(message)) onSocketMessage(simpleSocket, fromJSON(message));
            }
        );

        // Ignore the code & reason
        socket.on('close', (code, reason) => onSocketClose(simpleSocket));
    });

    // Ping all clients at a regular interval
    const ping_interval = setInterval(() => pingAll(serverWSS), PING_INTERVAL);

    serverWSS.on('listening', function() {
        // onServerOpen();
    });

    serverWSS.on('close', function() {
        clearInterval(ping_interval);
        // onServerClose();
    });

    // Start listening...
    serverHTTPS.listen(port);
}