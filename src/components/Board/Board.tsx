import { useState } from "react";
import { Cell } from "./subcomponents/Cell/Cell";
import { Location } from "../../types/Location";
import "./board.css";
import BoardState from "../../game/BoardState";

const N_ROWS = 25;
const N_COLS = 25;

export default function Board() {
	const [boardState] = useState(new BoardState(N_ROWS, N_COLS));

	boardState.fresh();

	return (
		<div
			className="board"
			style={{ gridTemplateColumns: `repeat(${N_COLS}, 1fr)` }}
		>
			{boardState.matrix.locations.map((l: Location) => (
				<div onClick={() => boardState.select(l)} key={`${l.i}-${l.j}`}>
					<Cell location={l} state={boardState.at(l)} />
				</div>
			))}
		</div>
	);
}
