import { useRef } from "react";
import Board from "./subcomponents/Board/Board";
import BoardState from "../../game/BoardState";

const N_ROWS = 25;
const N_COLS = 25;

export default function Game() {
	const boardState = useRef(new BoardState(N_ROWS, N_COLS));

	return <Board boardState={boardState.current} />;
}
