import { select } from "../../server/select.js";
import { revealAll } from "./reveal-all.js";

export function selectWithTurns(i, j, W, counters, board) {
	// The game is already over
	if (!counters.on) return null;

	const owner = ["A", "B"][counters.turn];

	let show = select(i, j, board);

	if (show.length === 0) {
		// Non-selectable i,j provided
		// No change to turn/owner
	} else {
		// Some values revealed
		counters.seq++;

		const firstValue = show[0].value;

		if (firstValue === "F") {
			// Found a flag
			// Increment their score
			counters.score[counters.turn]++;

			// Increment their luck
			counters.luck[counters.turn]++;

			// It's still the same player's turn

			// Did they just win the game?
			counters.on = counters.score[counters.turn] < W;
		} else {
			// Revealed a number value
			// Switch to next player's turn
			counters.turn = (counters.turn + 1) % 2;
		}
	}

	// Did they just win the game?
	// If so, append all unrevealed values
	// Ownership of the last revealed flag remains assigned
	if (!counters.on) {
		show = show.concat(revealAll(board));
	}

	// Add the owner property to each object
	show.forEach((rev) => (rev.owner = owner));

	return { show, ...counters };
}
