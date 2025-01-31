import { Location } from "./Location";

export type CellState = {
	location: Location;
	revealed: boolean;
	flag: boolean;
	number: number;
};