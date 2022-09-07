const Matrix = require('./matrix.js');
const Tile = require('./tile.js');

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

module.exports =
function randomBoard(N, M, F) {

    N = Math.max(N, 2);
    M = Math.max(M, 2);

    const board = new Matrix(N, M);

    // By default, every tile is a zero
    board.fill((i,j) => Tile(board, i, j));

    // Pick some tiles randomly
    const picks = board.random(F);

    // Set them as flags
    picks.forEach(tile => tile.isFlag(true));

    // For every flag tile, increment all its number neighbours
    // The increment() method ignores flag tiles
    picks.forEach(tile => tile.neighbours().forEach(nb => nb.increment()));

    return board;
};