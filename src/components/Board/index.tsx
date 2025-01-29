import { Cell } from "./subcomponents/Cell";
import { Location } from "../../types/Location";
import "./board.css";

const N_ROWS = 25;
const N_COLS = 25;

function locations(n: number, m: number): Array<Location> {
	const a = [];

	for (let i = 0; i < n; i++) {
		for (let j = 0; j < m; j++) {
			a.push({ i, j });
		}
	}

	return a;
}

export default function Board() {
	return (
		<div
			className="board"
			style={{ gridTemplateColumns: `repeat(${N_COLS}, 1fr)` }}
		>
			{locations(N_ROWS, N_COLS).map(({ i, j }) => (
				<Cell i={i} j={j} key={i * N_ROWS + j} />
			))}
		</div>
	);
}
