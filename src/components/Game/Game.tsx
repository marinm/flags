import { useRef } from "react";
import Board from "./subcomponents/Board/Board";
import GameState from "../../game/GameState";

const N_ROWS = 25;
const N_COLS = 25;

export default function Game() {
	const gameState = useRef(new GameState(N_ROWS, N_COLS));

	return (
		<div>
			<Board boardState={gameState.current} />
		</div>
	);
}
