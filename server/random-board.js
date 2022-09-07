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

    // Pick some tiles randomly and set them as flags
    board.random(F).forEach(tile => tile.isFlag(true));

    // Have each tile check its own neighbours and update its own number
    // (This is less than optimal but helps with code readability)
    board.forEach(tile => tile.updateNumber());

    return board;
};