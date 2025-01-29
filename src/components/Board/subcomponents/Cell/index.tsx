import "./cell.css";

export function Cell({ i, j }: { i: number; j: number }) {
	return (
		<div className="cell">
			{i},{j}
		</div>
	);
}
