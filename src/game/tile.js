export default class Tile {
	state;
	board;
	i;
	j;

	constructor(board, i, j) {
		this.board = board;
		this.i = i;
		this.j = j;

		// The default tile has value 0 and is not revealed
		// This is convenient for setting up a new board
		this.state = {value: 0, revealed: false};
	}

	value() {
		return this.state.value;
	}

	increment() {
		// Do nothing for a flag tile
		if (this.isFlag()) return null;

		// The number must be in the range [0...8]
		this.state.value = Math.min(this.state.value + 1, 8);
		return null;
	}

	isFlag(set) {
		if (set === true) this.state.value = "F";
		return this.state.value === "F";
	}

	isNumber() {
		return this.state.value != "F";
	}

	reveal() {
		this.state.revealed = true;
		return { i, j, value: this.state.value };
	}

	isRevealed() {
		return this.state.revealed;
	}

	updateNumber() {
		if (this.isFlag()) return;

		const flags = this.neighbours().filter((tile) => tile.isFlag());
		this.state.value = flags.length;
		return null;
	}

	neighbours() {
		//  TL TC TR
		//  CL    CR
		//  BL BC BR

		return [
			this.board.at(i - 1, j - 1), // TL
			this.board.at(i - 1, j - 0), // TC
			this.board.at(i - 1, j + 1), // TR
			this.board.at(i - 0, j - 1), // CL
			this.board.at(i - 0, j + 1), // CR
			this.board.at(i + 1, j - 1), // BL
			this.board.at(i + 1, j - 0), // BC
			this.board.at(i + 1, j + 1), // BR
		].filter((tile) => tile != undefined);
	}
}
