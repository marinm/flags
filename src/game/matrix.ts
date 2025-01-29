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

export default function Matrix(n: number, m: number) {
	const nodes = new Array(n * m);

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

		at(l: Location): any {
			return this.contains(l) ? nodes[l.i * m + l.j] : undefined;
		},

		set(l: Location, value: any): void {
			if (this.contains(l)) nodes[l.i * m + l.j] = value;
		},

		forEach(callback: (l: Location) => any): void {
			locations.forEach(callback);
		},

		fill(callback: (l: Location) => any): void {
			locations.forEach((l) => this.set(l, callback(l)));
		},

		filter(callback: (l: Location) => any): any[] {
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
