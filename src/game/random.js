export default {
	int(min, max) {
		return Math.floor(min + Math.random() * max);
	},

	ints(min, max, n) {
		// Return n unique integers
		// Use the Set object to maintain uniqueness
		const set = new Set();
		while (set.size < n) {
			set.add(this.int(min, max));
		}
		return Array.from(set);
	},

	index(size) {
		return this.int(0, size);
	},

	indices(size, n) {
		return this.ints(0, size, n);
	},
};
