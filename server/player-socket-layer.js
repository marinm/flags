
function PlayerSocket() {
    return {
        socketId: null,
        playerId: null,
    }
}

module.exports =
function PlayerSocketLayer(matchManager) {

    return {
        webSocketHandlers: {
            onServerOpen() {
                //
            },
    
            onServerClose() {
                //
            },
    
            onSocketOpen(simpleSocket) {
                matchManager.onSocketOpen(simpleSocket);
            },
    
            onSocketMessage(simpleSocket, message) {
                matchManager.onSocketMessage(simpleSocket, message);
            },
    
            onSocketClose(simpleSocket) {
                matchManager.onSocketClose();
            },
        }
    }
}