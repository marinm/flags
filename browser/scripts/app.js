import config from "./config.js";
import GameboardCanvas from "./gameboard-canvas.js";
import tilesheet from "./tilesheet.js";
import $ from "./fake-jquery.js";
import QuickWebSocket from "./quick-websocket.js";
import selectTile from "./select-tile.js";
import showStatus from "./show-status.js";
import showTurn from "./show-turn.js";
import clickableCells from "./clickable-cells.js";
import cellOnClick from "./cell-onclick.js";
import Board from "./board.js";
import autoplay from "./autoplay.js";
import toggleAutoplay from "./toggle-autoplay.js";
import handleMessage from "./handle-message.js";
import NoteBox from "./note-box.js";
import ScoreBox from "./score-box.js";

const {
	SERVER_ADDRESS,
	BOARD_NUM_ROWS,
	BOARD_NUM_COLUMNS,
	BOARD_CELL_SIZE,
	WINNING_SCORE,
} = config;

const view = {
	$: $,

	notebox: NoteBox($, "#note-box"),

	canvasboard: GameboardCanvas(
		document.querySelector("#gameboard-canvas"),
		BOARD_NUM_ROWS,
		BOARD_NUM_COLUMNS,
		BOARD_CELL_SIZE,
		tilesheet
	),

	scorebox: ScoreBox($, ["#player-0-score", "#player-1-score"]),
};

view.scorebox.setWinningScore(WINNING_SCORE);

const controls = {
	autoplay: false,
};

const gamestate = {
	playingAs: null,
	board: Board(BOARD_NUM_ROWS, BOARD_NUM_COLUMNS),
	turn: null,
	winner: null,
};

//
// WebSocket Messaging

const socket = QuickWebSocket({
	url: SERVER_ADDRESS,
	onError: onError,
	onOpen: onOpen,
	onMessage: onMessage,
	onClose: onClose,
});

// Add on-click event listener to the canvas
const boardClicks = clickableCells({
	element: view.canvasboard.canvas,
	w: BOARD_CELL_SIZE,
	h: BOARD_CELL_SIZE,
	onclick: cellOnClick,
	context: { gamestate, selectTile, socket },
});

// This is not necessary if an error event is also fired on fail
if (!socket) showStatus("disconnected", view, boardClicks);

function onError() {
	showStatus("disconnected", view, boardClicks);
}

function onOpen(quicksocket) {
	quicksocket.send({ type: "join" });
}

function onClose() {
	showStatus("disconnected", view, boardClicks);
}

function onMessage(quicksocket, message) {
	handleMessage(
		message,
		controls,
		view,
		gamestate,
		quicksocket,
		boardClicks,
		showTurn,
		showStatus,
		autoplay,
		selectTile
	);
}

//------------------------------------------------------------------------------
// Keyboard controls for autoplay

view.$("body").onKeyup("a", () =>
	toggleAutoplay(
		controls,
		autoplay,
		view,
		gamestate,
		view.canvasboard,
		socket,
		selectTile
	)
);
view.$("body").onKeyup("g", () =>
	autoplay.solverscan(gamestate, view.canvasboard)
);
view.$("body").onKeyup("n", () =>
	autoplay.select_next_unrevealed_flag(gamestate, socket)
);
