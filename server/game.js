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

const labels = require('./labels.js');
const Matrix = require('./matrix.js');
const randomBoard = require('./random-board.js');
const {reveal, revealAll} = require('./reveal.js');
const zerowalk = require('./zerowalk.js');

function FlagsGame(N, M, R) {
    // A randomly generated board
    const board = new randomBoard(N, M, R);

    var turn = 0;
    var score = [0, 0];
    var seq = 0;
    var on = true;

    // The game is over when a player finds R/2 flags
    const winning_score = Math.ceil(R/2);

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

    function select(i, j) {
        // Selected coordinates out of bounds
        if (!board.contains(i,j))
            return null;

        // The game is already over
        if (!on)
            return null;

        const k = i * M + j;
        var value = board.at(i,j);

        // Which tiles to reveal, if any
        var show = [];

        // If the tile is already revealed, do nothing
        if (!revealed.at(i,j)) {
            seq++;

            if (value === 0) {
                turn = (turn + 1) % 2;
                // The first zero must still be not revealed
                show = zerowalk(i, j, board, revealed);
            }
            else {
                // Revealed a non-zero value...
                revealed.set(i, j, true);

                if (value === labels.HIDDEN_FLAG) {
                    // Change the tile value from HIDDEN_FLAG to PLAYER_FLAG
                    board.set(i, j, labels.PLAYER_FLAGS[turn]);
                    value = board.at(i,j);

                    // Still the same player's turn
                    score[turn]++;

                    on = (score[turn] < winning_score);
                }
                else {
                    turn = (turn + 1) % 2;
                }
                show = [{i, j, value}];
            }

            // The game is over on this move
            // Append all unrevealed values
            if (!on) {
                show = show.concat( revealAll(revealed, board) );
            }
        }

        return { show, turn, score, on };
    }

    function getstate() {
        return { turn, score, seq, on };
    }

    return { N, M, R, board, get, select, getstate };
}

module.exports = FlagsGame;