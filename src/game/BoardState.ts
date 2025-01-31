import Matrix from "./Matrix";
import { Location } from "../types/Location";
import { CellState } from "../types/CellState";

export default class BoardState extends Matrix<CellState> {
	numFlags: number = 0;

	constructor(n: number, m: number) {
		super(n, m, (l: Location) => ({
			location: l,
			revealed: false,
			flag: false,
			number: 0,
		}));

		this.numFlags = (this.n + this.m) * 2;

		this.fresh();
	}

	// Generates a board with randomly placed flags
	//
	// A 6x6 board example (* are flags):
	//
	//     1  2  *  1  1  1
	//     1  *  2  1  1  *
	//     1  1  1  1  2  1
	//     0  0  1  *  1  0
	//     1  2  3  2  1  0
	//     1  *  *  1  0  0
	fresh() {
		// Pick some tiles randomly and set them as flags
		this.random(this.numFlags).forEach(
			(l: Location) => (this.at(l).flag = true)
		);

		// For each tile, count the flags around it
		this.forEach((l: Location) => this.updateNumberAt(l));
	}

	updateNumberAt(l: Location): void {
		const count = this.around(l)
			.map((l) => this.at(l))
			.filter((s: CellState) => s.flag).length;

		this.at(l).number = count;
	}

	reveal(l: Location): CellState {
		const cell = this.at(l);
		cell.revealed = true;
		return cell;
	}

	revealAll(): CellState[] {
		return this.filter((l) => !this.at(l).revealed).map((t) => t.reveal());
	}

	select(l: Location): CellState[] {
		const cell = this.at(l);

		// Selected coordinates out of bounds, or
		// Selected tile that was already revealed
		// Return empty array
		if (!this.contains(l) || cell.revealed) {
			return [];
		}

		if (cell.flag || cell.number != 0) {
			return [this.reveal(l)];
		}

		// Special case: selecting a zero results in a "zero walk"
		// All other tiles only result in a one-tile reveal
		return this.zeroWalk(l);
	}

	zeroWalk(l: Location): CellState[] {
		const queue: Location[] = [];
		const show: CellState[] = [];

		// Begin with this tile in the queue
		queue.push(l);

		while (queue.length > 0) {
			// Pop the next tile from the queue
			const current = queue.shift();

			if (!current) {
				continue;
			}

			const cell = this.at(current);

			// Stepped to a tile that's already been revealed
			// Nothing to do
			if (cell.revealed) {
				continue;
			}

			// Stepped to a flag
			// Don't reveal it
			if (cell.flag) {
				continue;
			}

			// Stepped to numeric value
			// Reveal it
			show.push(this.reveal(current));

			// If this is a zero
			// Add all neighbours to the visit queue
			if (cell.number === 0) {
				queue.push(...this.around(current));
			}

			// Some tiles will pass through the queue multiple times
		}

		return show;
	}
}
