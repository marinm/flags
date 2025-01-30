// Matrix (2-dimensional array) with some helper functions
//
//      *  *  *  *  *
//      *  *  *  *  *
//      *  *  *  *  *
//      *  *  *  *  *
//
// n : number of rows
// m : number of columns
// i : row index
// j : column index

import random from "./random.js";
import { Location } from "../types/Location.js";

export default function Matrix<Type>(n: number, m: number) {
	const nodes = new Array<Type>(n * m);

	const locations: Location[] = [];
	for (let i = 0; i < n; i++) {
		for (let j = 0; j < m; j++) {
			locations.push({ i, j });
		}
	}

	return {
		all() {
			// Should probably return a copy?
			// This returns a reference to the original array
			return nodes;
		},

		contains(l: Location): boolean {
			return l.i >= 0 && l.i < n && l.j >= 0 && l.j < m;
		},

		at(l: Location): Type | undefined {
			return this.contains(l) ? nodes[l.i * m + l.j] : undefined;
		},

		set(l: Location, value: Type): void {
			if (this.contains(l)) {
				nodes[l.i * m + l.j] = value;
			}
		},

		forEach(callback: (l: Location) => void): void {
			locations.forEach(callback);
		},

		fill(callback: (l: Location) => Type): void {
			locations.forEach((l) => this.set(l, callback(l)));
		},

		filter(callback: (l: Location) => boolean): any[] {
			return locations.filter(callback).map(this.at);
		},

		random(k: number) {
			// Select k cells randomly
			return random.indices(nodes.length, k).map((ij) => locations[ij]);
		},

		// For debugging
		print() {
			for (let i = 0; i < n; i++) {
				// All nodes on this row
				console.log(...this.filter((l: Location) => i === l.i));
			}
		},
	};
}
