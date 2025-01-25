export function handle_join(match) {
	return function (playerSocket, message) {
		if (match.playerSocketA === null) {
			match.playerSocketA = playerSocket;

			const claim = JSON.stringify({
				match_id: match.id,
				playing_as: 0,
			});

			playerSocket.send({
				type: "join",
				status: "OPEN",
				id: match.id,
				playing_as: 0,
			});
			return null;
		}

		if (match.playerSocketB === null) {
			match.playerSocketB = playerSocket;

			const claim = JSON.stringify({
				match_id: match.id,
				playing_as: 1,
			});

			playerSocket.send({
				type: "join",
				status: "OPEN",
				id: match.id,
				playing_as: 1,
			});
			match.playerSocketA.send({ type: "start" });
			match.playerSocketB.send({ type: "start" });
			return null;
		}

		playerSocket.send({ type: "join", status: "BUSY" });
		return null;
	};
}
