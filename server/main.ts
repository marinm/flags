import dotenv from "dotenv";
dotenv.config();

import { PlayerSocketLayer } from "./player-socket-layer.js";
import { JsonWebSocketServer } from "./json-websocket-server.js";
import { MatchManager } from "./match-manager.js";

const {
	WSS_PORT,
	SSL_CERT,
	SSL_KEY,
	BOARD_NUM_ROWS,
	BOARD_NUM_COLUMNS,
	BOARD_NUM_FLAGS,
	WINNING_SCORE,
} = process.env;

const matchManager = MatchManager({
	n: BOARD_NUM_ROWS,
	m: BOARD_NUM_COLUMNS,
	f: BOARD_NUM_FLAGS,
	w: WINNING_SCORE,
});

const playerSockets = PlayerSocketLayer(matchManager);

// Start up a server...
JsonWebSocketServer({
	port: WSS_PORT,
	cert: SSL_CERT,
	key: SSL_KEY,
	onServerOpen: playerSockets.webSocketHandlers.onServerOpen,
	onServerClose: playerSockets.webSocketHandlers.onServerClose,
	onSocketOpen: playerSockets.webSocketHandlers.onSocketOpen,
	onSocketMessage: playerSockets.webSocketHandlers.onSocketMessage,
	onSocketClose: playerSockets.webSocketHandlers.onSocketClose,
});
