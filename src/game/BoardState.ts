import Matrix from "./matrix";
import { Location } from "../types/Location";
import { CellState } from "../types/CellState";

export default class BoardState {
	n: number = 0;
	m: number = 0;
	numFlags: number = 0;
	matrix;

	constructor(n: number, m: number) {
		this.n = n;
		this.m = m;
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

	fresh() {
		this.randomize();
	}

	randomize() {
		this.matrix
			.random(this.numFlags)
			.forEach((l: Location) => (this.matrix.at(l).flag = true));
	}

	at(l: Location): CellState {
		return this.matrix.at(l);
	}
}
