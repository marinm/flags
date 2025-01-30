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

	constructor(n: number, m: number, initialValue: () => Type) {
		this.n = n;
		this.m = m;
		this.nodes = new Array<Type>(n * m);

		this.locations = [];
		for (let i = 0; i < n; i++) {
			for (let j = 0; j < m; j++) {
				this.locations.push({ i, j });
				this.nodes[i * this.m + j] = initialValue();
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

	around(l: Location): Location[]
	{
		//  TL TC TR
		//  CL    CR
		//  BL BC BR

		return [
				[l.i - 1, l.j - 1], // TL
				[l.i - 1, l.j - 0], // TC
				[l.i - 1, l.j + 1], // TR
				[l.i - 0, l.j - 1], // CL
				[l.i - 0, l.j + 1], // CR
				[l.i + 1, l.j - 1], // BL
				[l.i + 1, l.j - 0], // BC
				[l.i + 1, l.j + 1], // BR
			]
			.map(([i, j]) => ({i, j}))
			.filter(l => this.contains(l));
	}

	// For debugging
	print() {
		for (let i = 0; i < this.n; i++) {
			// All nodes on this row
			console.log(...this.filter((l: Location) => i === l.i));
		}
	}
}
