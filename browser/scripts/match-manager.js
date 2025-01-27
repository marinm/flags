import { randomUUID } from "node:crypto";
import { handle_join } from "./handle-join-server.js";
import { handle_select } from "./handle-select.js";
import { Match } from "../../server/match.js";

export function MatchManager({ n, m, f, w }) {
	let match = {
		playerSocketA: null,
		playerSocketB: null,
		id: null,
		match: null,
	};

	const handlers = {
		join: handle_join(match),
		select: handle_select(match),
	};

	function new_game() {
		match.playerSocketA = null;
		match.playerSocketB = null;
		match.id = randomUUID();
		match.match = Match(n, m, f, w);

		return null;
	}

	new_game();

	return {
		onPlayerSocketOpen: function (playerSocket) {
			playerSocket.send({
				type: "version",
				playerId: playerSocket.playerId,
			});
		},

		onPlayerSocketClose: function (playerSocket) {
			// On disconnect,
			// [0] Client was PLAYING_AS 'A' and waiting for 'B', end game
			// [1] Client was PLAYING_AS 'A', end game, TELL 'B'
			// [2] Client was PLAYING_AS 'B', end game, TELL 'A'
			// [3] Client was not playing, do nothing

			if (playerSocket === match.playerSocketA) {
				match.playerSocketA = null;
				if (match.playerSocketB != null) {
					match.playerSocketB.send({ type: "opponent-disconnected" });
					// Also kick out the other player
					match.playerSocketB = null;
				}
				new_game();
				return null;

				// notify a waiting player?
			}

			if (playerSocket === match.playerSocketB) {
				match.playerSocketB = null;
				if (match.playerSocketA != null) {
					match.playerSocketA.send({ type: "opponent-disconnected" });
					// Also kick out the other player
					match.playerSocketA = null;
				}
				new_game();
				return null;

				// notify a waiting player?
			}

			// Client wasn't an active player. Do nothing.
			return null;
		},

		onPlayerSocketMessage: function (playerSocket, message) {
			// If the message type does not map to a function in the handlers
			// dict, then drop this message.
			handlers[message.type]?.(playerSocket, message);
		},
	};
}
