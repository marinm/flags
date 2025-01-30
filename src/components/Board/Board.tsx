import { useState, useEffect, useRef } from "react";
import { Cell } from "./subcomponents/Cell/Cell";
import { Location } from "../../types/Location";
import "./board.css";
import BoardState from "../../game/BoardState";

const N_ROWS = 25;
const N_COLS = 25;

export default function Board() {
	const boardState = useRef(new BoardState(N_ROWS, N_COLS));

	function onClick(l: Location): void {
		boardState.current.select(l);
	}

	return (
		<div
			className="board"
			style={{ gridTemplateColumns: `repeat(${N_COLS}, 1fr)` }}
		>
			{boardState.current.matrix.locations.map((l: Location) => (
				<div onClick={() => onClick(l)} key={`${l.i}-${l.j}`}>
					<Cell location={l} state={boardState.current.at(l)} />
				</div>
			))}
		</div>
	);
}
