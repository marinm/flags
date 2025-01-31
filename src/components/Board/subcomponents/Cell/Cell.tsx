import { CellState } from "../../../../types/CellState";
import { classes } from "../../../../utils/classes";
import "./cell.css";

export function Cell({ state }: { state: CellState }) {
	const className = classes({
		cell: true,
		hidden: !state.revealed,
	});

	return (
		<div className={className}>
			{state.flag ? (
				<img src="flag.svg" className="flag" />
			) : (
				state.number
			)}
		</div>
	);
}
