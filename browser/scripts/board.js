import Matrix from "./matrix.js";

export default function Board(n, m) {
	const board = Matrix(n, m);

	board.fill(function (i, j) {
		return {
			i: i,
			j: j,
			hidden: true,
			value: null,
			owner: null,
		};
	});

	function adjacent(i, j) {
		return [
			board.at(i - 1, j - 1),
			board.at(i - 1, j - 0),
			board.at(i - 1, j + 1),
			board.at(i - 0, j - 1),
			board.at(i - 0, j + 1),
			board.at(i + 1, j - 1),
			board.at(i + 1, j - 0),
			board.at(i + 1, j + 1),
		].filter((cell) => cell != undefined);
	}

	return { ...board, adjacent };
}
