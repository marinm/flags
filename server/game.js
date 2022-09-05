// Flags game generator
// [Model]-View-Controller
//
// Randomly generates a board
// Maintains game state - what has been revealed so far
//
// A 6x6 board example:
//
//                          M
//           0     1     2     3     4     5    j
//        +-----+-----+-----+-----+-----+-----+
//     0  |  1  |  2  |  *  |  1  |  1  |  1  |
//        +-----+-----+-----+-----+-----+-----+
//     1  |  1  |  *  |  2  |  1  |  1  |  *  |
//        +-----+-----+-----+-----+-----+-----+
//     2  |  1  |  1  |  1  |  1  |  2  |  1  |
//  N     +-----+-----+-----+-----+-----+-----+
//     3  |  0  |  0  |  1  |  *  |  1  |  0  |
//        +-----+-----+-----+-----+-----+-----+
//     4  |  1  |  2  |  3  |  2  |  1  |  0  |
//        +-----+-----+-----+-----+-----+-----+
//     5  |  1  |  *  |  *  |  1  |  0  |  0  |
//        +-----+-----+-----+-----+-----+-----+
//     i

const Matrix = require('./matrix.js');
const randomBoard = require('./random-board.js');
const select = require('./select.js');

function FlagsGame(N, M, F) {
    // A randomly generated board
    const board = new randomBoard(N, M, F);

    const counters = {
        turn  : 0,
        score : [0,0],
        seq   : 0,
        on    : true,
    };

    // What has been revealed so far (array of bools)
    const revealed = new Matrix(N, M);

    // At the start of the game, nothing has been revealed yet
    revealed.fill( (i,j) => false );


    function get(i, j) {
        const k = i * M + j;
        if (!board.contains(i,j) || !revealed.at(i,j))
            return null;
        return board.at(i,j);
    }

    function getstate() {
        return counters;
    }

    return { N, M, F, board, get, getstate,
        select:
        function(i,j) {
            return select(i, j, F, counters, board, revealed)
        }
    };
}

module.exports = FlagsGame;