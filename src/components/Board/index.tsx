import './board.css';

export default function Board() {
	return (
		<div className="board">
			<div className="row">
				<div className="cell">1</div>
				<div className="cell">2</div>
				<div className="cell">3</div>
			</div>
			<div className="row">
				<div className="cell">4</div>
				<div className="cell">5</div>
				<div className="cell">6</div>
			</div>
			<div className="row">
				<div className="cell">7</div>
				<div className="cell">8</div>
				<div className="cell">9</div>
			</div>
		</div>
	);
}
