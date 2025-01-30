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

export default class Matrix<Type> {
	n: number = 0;
	m: number = 0;
	nodes: Type[] = [];
	locations: Location[] = [];

	constructor(n: number, m: number, initialValue: Type) {
		this.n = n;
		this.m = m;
		this.nodes = new Array<Type>(n * m);
		this.nodes.fill(initialValue);

		this.locations = [];
		for (let i = 0; i < n; i++) {
			for (let j = 0; j < m; j++) {
				this.locations.push({ i, j });
			}
		}
	}

	all() {
		// Should probably return a copy?
		// This returns a reference to the original array
		return this.nodes;
	}

	contains(l: Location): boolean {
		return l.i >= 0 && l.i < this.n && l.j >= 0 && l.j < this.m;
	}

	at(l: Location): Type {
		return this.nodes[l.i * this.m + l.j];
	}

	set(l: Location, value: Type): void {
		this.nodes[l.i * this.m + l.j] = value;
	}

	forEach(callback: (l: Location) => void): void {
		this.locations.forEach(callback);
	}

	fill(callback: (l: Location) => Type): void {
		this.locations.forEach((l) => this.set(l, callback(l)));
	}

	filter(callback: (l: Location) => boolean): any[] {
		return this.locations.filter(callback).map(this.at);
	}

	random(k: number) {
		// Select k cells randomly
		return random
			.indices(this.nodes.length, k)
			.map((ij) => this.locations[ij]);
	}

	// For debugging
	print() {
		for (let i = 0; i < this.n; i++) {
			// All nodes on this row
			console.log(...this.filter((l: Location) => i === l.i));
		}
	}
}
