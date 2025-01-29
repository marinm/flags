import { Cell } from "./subcomponents/Cell";
import "./board.css";

export default function Board() {
	const N_ROWS = 50;
	const N_COLS = 50;

	const coordinates = [];

	for (let i = 0; i < N_ROWS; i++) {
		for (let j = 0; j < N_COLS; j++) {
			coordinates.push({ i, j });
		}
	}

	return (
		<div className="board">
			{coordinates.map(({ i, j }) => (
				<Cell i={i} j={j} />
			))}
		</div>
	);
}
