import {Tile} from './tile.js';
import {Grid} from './grid.js';

const MIN_NUM_ROWS    = 2;
const MIN_NUM_COLUMNS = 2;
const MIN_NUM_FLAGS   = 2;

export
function Board(params) {

    // The game model and manager

	const numRows    = Math.max( MIN_NUM_ROWS    , params.numRows    );
	const numColumns = Math.max( MIN_NUM_COLUMNS , params.numColumns );
	const numFlags   = Math.max( MIN_NUM_FLAGS   , params.numFlags   );

	const board = {
        ...Grid(numRows, numColumns),

        BoardTile:
        function(i, j) {
            const grid = this;
            return {
                ...Tile(),

                coordinates:
                function() {
                    return {i, j};
                },
    
                neighbours:
                function() {
                    return grid.neighboursOf(i, j);
                },
    
                incrementNeighbours:
                function() {
                    this.neighbours().forEach((n) => n.increment());
                }
            }
        },

        allValues:
        function() {
			return this.all().map(t => t.state());
		},

		allHidden:
        function() {
			return board.all().filter(t => t.isHidden());
		},

        generateRandom:
        function(nFlags) {
            // Fill in the grid with new BoardTile objects
            // They all have value zero by default
            this.fillByCoordinates( (i, j) => this.BoardTile(i, j) );

            // Randomly select some tiles
            const randomlySelected = this.selectRandom(nFlags);

            // Set them as flags
            randomlySelected.forEach(t => t.setFlag());

            // Increment all their neighbours
            randomlySelected.forEach(t => t.incrementNeighbours());
        },

        reveal:
        function(t, isZeroWalk) {
            // Revealing a zero tile triggers a "zero walk" that reveals all
            // adjacent zeros until a boundary of non-zero tiles is reached.

            // Ignore this tile if it
            // - has already been revealed
            // - is a flag and this function call is part of a recursive zero walk
            const ignore = !t || !t.isHidden() || (t.isFlag() && isZeroWalk);

            return ignore ? [] : [
                // This tile
                {...t.coordinates(), ...t.reveal()},

                // The neighbours, if this is a zero tile
                // There's something slow here...
                ...( t.isZero() ? t.neighbours().map(n => this.reveal(n, true)).flat(Infinity) : [] )
            ];
        }
    };

	// Create a random board
	board.generateRandom(numFlags);
    // ...then ready to go

	return {
		tile:
        function(i, j) {
			return board.at(i, j);
		},

		select:
        function(i, j) {
            return board.reveal( board.at(i, j) );
		},

		revealRemaining:
        function() {
			// Reveal all remaining hidden tiles
			// And return their values
			return board.allHidden().map((t) => t.reveal());
		},
	};
};
