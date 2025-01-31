import Matrix from "./matrix";
import { Location } from "../types/Location";
import { CellState } from "../types/CellState";

export default class BoardState {
	n: number = 0;
	m: number = 0;
	numFlags: number = 0;
	matrix;

	constructor(n: number, m: number) {
		this.n = Math.max(n, 2);
		this.m = Math.max(m, 2);
		this.numFlags = this.n + this.m;

		const defaultCellState = (l: Location) => ({
			location: l,
			revealed: false,
			flag: false,
			number: 0,
		});

		this.matrix = new Matrix<CellState>(this.n, this.m, defaultCellState);

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
		this.matrix
			.random(this.numFlags)
			.forEach((l: Location) => (this.matrix.at(l).flag = true));

		// For each tile, count the flags around it
		this.matrix.forEach((l: Location) => this.updateNumberAt(l));
	}

	updateNumberAt(l: Location): void {
		const count = this.matrix
			.around(l)
			.map((l) => this.matrix.at(l))
			.filter((s: CellState) => s.flag).length;

		this.at(l).number = count;
	}

	at(l: Location): CellState {
		return this.matrix.at(l);
	}

	reveal(l: Location): CellState {
		const cell = this.at(l);
		cell.revealed = true;
		return cell;
	}

	select(l: Location): CellState[] {
		const cell = this.at(l);

		// Selected coordinates out of bounds, or
		// Selected tile that was already revealed
		// Return empty array
		if (!this.matrix.contains(l) || cell.revealed) {
			return [];
		}

		// Special case: selecting a zero results in a "zero walk"
		// All other tiles only result in a one-tile reveal
		return cell.number === 0 ? this.zeroWalk(l) : [this.reveal(l)];
	}

	zeroWalk(l: Location): CellState[] {
		return this.matrix.around(l).map(l => this.at(l));

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
			show.push(this.reveal(l));

			// If this is a zero
			// Add all neighbours to the visit queue
			if (cell.number === 0) {
				queue.push(...this.matrix.around(current));
			}

			// Some tiles will pass through the queue multiple times
		}

		return show;
	}
}
