const Matrix = require('./matrix.js');
const forEachNeighbour = require('./for-each-neighbour.js');
const labels = require('./labels.js');

// Generates a board with randomly placed flags
//
// A 6x6 board example (* are flags):
//
//     1  2  *  1  1  1
//     1  *  2  1  1  *
//     1  1  1  1  2  1
//     0  0  1  *  1  0
//     1  2  3  2  1  0
//     1  *  *  1  0  0

function increment(i, j, board) {
    // Do nothing for a flag tile
    if ( board.at(i,j) === labels.HIDDEN_FLAG ) return;
    
    // Tiles on the edge don't have neighbours on all sides
    // This is OK because set() ignores out-of-bounds indices
    board.set(i, j, board.at(i, j) + 1);
}

module.exports =
function randomBoard(N, M, F) {

    N = Math.max(N, 2);
    M = Math.max(M, 2);

    const board = new Matrix(N, M);

    // By default, every tile is a zero
    board.fill( (i,j) => 0 );

    // Select some tiles randomly
    const flags = board.random(F);

    // Set them as flags
    flags.forEach(([i,j]) => board.set(i, j, labels.HIDDEN_FLAG));

    // For every flag tile, increment all its number neighbours
    flags.forEach(([i,j]) => forEachNeighbour(i, j, increment, board));

    return board;
};