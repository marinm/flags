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

import random from './random.js';

export default
function Matrix(n, m) {

    const nodes = new Array(n * m);

    // Convert flat array index (k) to row/column (i,j) indices
    const ij = (k) => [Math.floor(k / m), k % m];

    const coordinates = [];
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < m; j++) {
            coordinates.push([i, j]);
        }
    }

    return {
        all:
        function() {
            // Should probably return a copy?
            // This returns a reference to the original array
            return nodes;
        },

        contains:
        function(i, j) {
            return (i >= 0 && i < n) && (j >= 0 && j < m);
        },

        at:
        function(i, j) {
            return this.contains(i, j) ? nodes[i * m + j] : undefined;
        },

        set:
        function(i, j, value) {
            if (this.contains(i, j))
                nodes[i * m + j] = value;
        },

        forEach:
        function(callback) {
            coordinates.forEach(([i,j]) => callback(i, j, this.at(i,j)));
        },

        fill:
        function(factory) {
            coordinates.forEach(([i,j]) => this.set(i, j, factory(i, j)));
        },

        filter:
        function(condition) {
            // Returns an array of coordinates
            const ij = coordinates.filter(([i,j]) => condition(this.at(i,j)));
            return ij.map(([i,j]) => this.at(i,j));
        },

        random:
        function(k) {
            // Select k cells randomly
            const flat_indices = random.indices(nodes.length, k);
            const ij_indices = flat_indices.map(flat => coordinates[flat]);
            const picks = ij_indices.map(([i,j]) => this.at(i,j));
            return picks;
        },

        // For debugging
        print:
        function() {
            for (let i = 0; i < n; i++) {
                // All nodes on this row
                const row = this.filter( (i_,j_) => i === i_).map( ([i_, j_]) => this.at(i_, j_) );
                console.log(...row);
            }
        }
    };
};