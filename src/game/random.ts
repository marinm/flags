export default {
	int(min: number, max: number): number {
		return Math.floor(min + Math.random() * max);
	},

	ints(min: number, max: number, n: number): number[] {
		// Return n unique integers
		// Use the Set object to maintain uniqueness
		const set: Set<number> = new Set();
		while (set.size < n) {
			set.add(this.int(min, max));
		}
		return Array.from(set);
	},

	index(size: number): number {
		return this.int(0, size);
	},

	indices(size: number, n: number): number[] {
		return this.ints(0, size, n);
	},
};
