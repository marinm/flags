import { useState, useEffect, useRef } from "react";
import { CellState } from "../../types/CellState";
import { Cell } from "./subcomponents/Cell/Cell";
import { Location } from "../../types/Location";
import "./board.css";
import BoardState from "../../game/BoardState";

const N_ROWS = 25;
const N_COLS = 25;

export default function Board() {
	const boardState = useRef(new BoardState(N_ROWS, N_COLS));
	const [cells, setCells] = useState<CellState[]>(boardState.current.all());

	useEffect(() => setCells([...boardState.current.all()]), []);

	function onClick(l: Location): void {
		boardState.current.select(l);
		setCells([...boardState.current.all()]);
	}

	return (
		<div
			className="board"
			style={{ gridTemplateColumns: `repeat(${N_COLS}, 1fr)` }}
		>
			{cells.map((c) => (
				<div
					key={`${c.location.i}-${c.location.j}`}
					onClick={() => onClick(c.location)}
				>
					<Cell state={c} />
				</div>
			))}
		</div>
	);
}
