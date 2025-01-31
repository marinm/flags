import BoardState from "./BoardState";
import { Location } from "../types/Location";

export default class GameState extends BoardState {
	turn: number = 0;
	playerTurn: number = 0;

	constructor(n: number, m: number) {
		super(n, m);
	}

	playerSelect(player: number, l: Location): void {
		// If it's not this player's turn, do nothing
		if (player !== this.playerTurn) {
			return;
		}

		this.select(l);

		this.turn++;
		this.playerTurn = this.turn % 2;
	}
}
