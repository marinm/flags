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

const random = require('./random.js');

module.exports =
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
            return this.contains(i, j)
                ? nodes[i * m + j]
                : undefined;
        },

        set:
        function(i, j, value) {
            if ( this.contains(i, j) )
                nodes[i * m + j] = value;
        },

        forEach:
        function(callback) {
            coordinates.forEach(([i,j]) => callback(i, j));
        },

        fill:
        function(factory) {
            this.forEach( (i, j) => this.set(i, j, factory(i, j)) );
        },

        filter:
        function(condition) {
            return coordinates.filter( ([i,j]) => condition(i,j)  );
        },

        random:
        function(k) {
            // Select k indices randomly
            // Return only the {i,j} indices
            return random.indices(nodes.length, k).map(k => coordinates[k]);
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