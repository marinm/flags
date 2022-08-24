import {random} from './random.js';

export
function Grid(n, m) {

    // Rectangular grid with some helper functions
    //
    // n : number of rows
    // m : number of columns
    // i : row index
    // j : column index

    const nodes = new Array(n * m);

    return {
        all:
        function() {
            return nodes;
        },

        coordinatesAreInBounds:
        function(i, j) {
            return (i >= 0 && i < n) && (j >= 0 && j < m);
        },

        at:
        function(i, j) {
            return this.coordinatesAreInBounds(i, j) ? nodes[i * m + j] : undefined;
        },

        set:
        function(i, j, value) {
            if ( this.coordinatesAreInBounds(i, j) )
                nodes[i * m + j] = value;
        },

        neighboursOf:
        function(i, j) {
            const all = [
                this.at(i - 1, j - 1), // top-left
                this.at(i - 1, j - 0), // top-center
                this.at(i - 1, j + 1), // top-right
                this.at(i - 0, j - 1), // center-left
                this.at(i - 0, j + 1), // center-right
                this.at(i + 1, j - 1), // bottom-left
                this.at(i + 1, j - 0), // bottom-center
                this.at(i + 1, j + 1), // bottom-right
            ];

            return all.filter(t => t != undefined);
        },

        scan:
        function(callback) {
            for (let i = 0; i < n; i++) {
                for (let j = 0; j < m; j++) {
                    callback(i, j, this.at(i, j));
                }
            }
        },

        fillByCoordinates:
        function(factory) {
            this.scan( (i, j, node) => this.set(i, j, factory(i, j)) );
        },

        selectRandom:
        function(k) {
            // Select k indices randomly
            const selected = random.indices(nodes.length, k);

            // Return a shallow copy of the randomly selected items
            return nodes.filter( (node, i) => selected.has(i) );
        }
    };
}