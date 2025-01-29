import { Cell } from "./subcomponents/Cell";
import "./board.css";

const N_ROWS = 50;
const N_COLS = 50;

type Location = {
	i: number,
	j: number
};

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
		<div className="board">
			{locations(N_ROWS, N_COLS).map(({ i, j }) => (
				<Cell i={i} j={j} key={i * N_ROWS + j} />
			))}
		</div>
	);
}
