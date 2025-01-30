import { useState } from "react";
import { Cell } from "./subcomponents/Cell/Cell";
import { Location } from "../../types/Location";
import "./board.css";
import Matrix from "../../game/matrix";
import { CellState } from "../../types/CellState";

const N_ROWS = 25;
const N_COLS = 25;

export default function Board() {
	const defaultCellState: CellState = {
		revealed: false,
		flag: false,
		number: 0,
	};

	const [matrix] = useState(
		new Matrix<CellState>(N_ROWS, N_COLS, () => ({ ...defaultCellState }))
	);

	matrix
		.random(N_ROWS + N_COLS)
		.forEach((l: Location) => (matrix.at(l).flag = true));

	return (
		<div
			className="board"
			style={{ gridTemplateColumns: `repeat(${N_COLS}, 1fr)` }}
		>
			{matrix.locations.map((l) => (
				<Cell location={l} state={matrix.at(l)} key={`${l.i}-${l.j}`} />
			))}
		</div>
	);
}
