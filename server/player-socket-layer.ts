function PlayerSocket(simpleSocket) {
	return {
		playerId: simpleSocket.id,
		send: simpleSocket.send,
	};
}

export function PlayerSocketLayer(matchManager) {
	return {
		webSocketHandlers: {
			onServerOpen() {
				//
			},

			onServerClose() {
				//
			},

			onSocketOpen(simpleSocket) {
				const playerSocket = PlayerSocket(simpleSocket);
				matchManager.onPlayerSocketOpen(playerSocket);
			},

			onSocketMessage(simpleSocket, message) {
				const playerSocket = PlayerSocket(simpleSocket);
				matchManager.onPlayerSocketMessage(playerSocket, message);
			},

			onSocketClose(simpleSocket) {
				const playerSocket = PlayerSocket(simpleSocket);
				matchManager.onPlayerSocketClose(playerSocket);
			},
		},
	};
}
