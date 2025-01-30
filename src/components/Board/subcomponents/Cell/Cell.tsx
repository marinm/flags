import { Location } from "../../../../types/Location";
import { CellState } from "../../../../types/CellState";
import { classes } from "../../../../utils/classes";
import "./cell.css";

export function Cell({
	location,
	state,
}: {
	location: Location;
	state: CellState;
}) {
	const className = classes({
		flag: true,
		hidden: !state.revealed,
	});

	return (
		<div className="cell" onClick={() => console.log(location, state)}>
			{state.flag ? (
				<img src="flag.svg" className={className} />
			) : (
				state.number
			)}
		</div>
	);
}
