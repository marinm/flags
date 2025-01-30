import { useState, useEffect, useRef } from "react";
import { Cell } from "./subcomponents/Cell/Cell";
import { CellState } from "../../types/CellState";
import { Location } from "../../types/Location";
import "./board.css";
import BoardState from "../../game/BoardState";

const N_ROWS = 25;
const N_COLS = 25;

export default function Board() {
	const boardState = useRef(new BoardState(N_ROWS, N_COLS));
	const [cells, setCells] = useState<CellState[]>(
		boardState.current.matrix.nodes
	);

	function onClick(l: Location): void {
		boardState.current.select(l);
		setCells([...boardState.current.matrix.nodes]);
	}

	function index(l: Location): number {
		return l.i * N_COLS + l.j;
	}

	return (
		<div
			className="board"
			style={{ gridTemplateColumns: `repeat(${N_COLS}, 1fr)` }}
		>
			{boardState.current.matrix.locations.map((l: Location) => (
				<div onClick={() => onClick(l)} key={`${l.i}-${l.j}`}>
					<Cell location={l} state={cells[index(l)]} />
				</div>
			))}
		</div>
	);
}
