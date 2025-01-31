import { useState, useEffect } from "react";
import { CellState } from "../../../../types/CellState";
import { Cell } from "./subcomponents/Cell/Cell";
import { Location } from "../../../../types/Location";
import "./board.css";
import BoardState from "../../../../game/BoardState";

export default function Board({ boardState }: { boardState: BoardState }) {
	const [cells, setCells] = useState<CellState[]>(boardState.all());

	useEffect(() => setCells([...boardState.all()]), []);

	function onClick(l: Location): void {
		boardState.select(l);
		setCells([...boardState.all()]);
	}

	return (
		<div
			className="board"
			style={{ gridTemplateColumns: `repeat(${boardState.m}, 1fr)` }}
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
