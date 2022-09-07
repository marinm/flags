// Flags game generator
// [Model]-View-Controller
//
// Randomly generates a board
// Maintains game state - what has been revealed so far
//
// A 6x6 board example:
//     1  2  *  1  1  1
//     1  *  2  1  1  *
//     1  1  1  1  2  1
//     0  0  1  *  1  0
//     1  2  3  2  1  0
//     1  *  *  1  0  0

const Matrix = require('./matrix.js');
const randomBoard = require('./random-board.js');
const selectWithTurns = require('./select-with-turns.js');

module.exports =
function FlagsGame(N, M, F, W) {

    const counters = {
        turn  : 0,
        score : [0,0],
        seq   : 0,
        on    : true,
    };

    // A randomly generated board
    const board = randomBoard(N, M, F);

    return {
        getstate : () => counters,
        select   : (i,j) => selectWithTurns(i, j, W, counters, board)
    };
}