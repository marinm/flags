export default function showTurn(gamestate, view, showStatus, boardClicks) {
	const status =
		gamestate.playingAs === gamestate.turn ? "your-turn" : "opponents-turn";
	showStatus(status, view, boardClicks);
}
