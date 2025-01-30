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

		const defaultCellState: CellState = {
			revealed: false,
			flag: false,
			number: 0,
		};

		this.matrix = new Matrix<CellState>(this.n, this.m, () => ({
			...defaultCellState,
		}));
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

	updateNumberAt(l: Location): void
	{
		const count = this.matrix
			.around(l)
			.map(l => this.matrix.at(l))
			.filter((s: CellState) => s.flag)
			.length;

		this.at(l).number = count;
	}

	at(l: Location): CellState {
		return this.matrix.at(l);
	}
}
