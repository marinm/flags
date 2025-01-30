import { Location } from "../../../../types/Location";
import { CellState } from "../../../../types/CellState";
import "./cell.css";

export function Cell({
	location,
	state,
}: {
	location: Location;
	state: CellState;
}) {
	return (
		<div className="cell" onClick={() => console.log(location, state)}>
			{state.flag ? 'F' : state.number}
		</div>
	);
}
