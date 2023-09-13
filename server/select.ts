import { zerowalk } from "./zerowalk.js";

export function select(i, j, board) {
	const tile = board.at(i, j);

	// Selected coordinates out of bounds, or
	// Selected tile that was already revealed
	// Return empty array
	if (!tile || tile.isRevealed()) return [];

	// Special case: selecting a zero results in a "zero walk"
	// All other tiles only result in a one-tile reveal
	return tile.value() === 0 ? zerowalk(tile) : [tile.reveal()];
}
