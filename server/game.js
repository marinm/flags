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
const randomBoard = require('./random-board.js');

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
    const revealed = new Array(N * M);
    revealed.fill(false);

    function get(i, j) {
        const k = i * M + j;
        if (!board.contains(i,j) || !revealed[k])
            return null;
        return board.at(i,j);
    }

    function reveal(i, j) {
        const k = i * M + j;
        revealed[k] = true;
        return {i, j, value: board.at(i,j)};
    }

    // Reveal all remaining hidden tiles
    // Should only be called when game is over
    function revealall() {
        if (on) {
            return null;
        }

        const remaining = [];
        for (var i = 0; i < N; i++) {
            for (var j = 0; j < M; j++) {
                // A failed get() indicates an unrevealed tile
                if (get(i,j) === null) {
                    remaining.push( reveal(i, j) );
                }
            }
        }
        return remaining;
    }

    function zerowalk(i, j) {
        // The first zero must still be not revealed

        // Stepped out of bounds
        // Nothing to do
        if (!board.contains(i,j))
            return [];

        const k = i * M + j;

        // Stepped to a value that's already been revealed
        // Nothing to do
        if (revealed[k])
            return [];

        const value = board.at(i,j);

        // Stepped to a flag
        // Don't reveal it
        if (value === labels.HIDDEN_FLAG)
            return [];

        // Stepped to a non-zero numeric tile
        // Reveal it and return the value
        if (value != '0')
            return [ reveal(i, j) ];

        // Found a zero...
        // First item on the newly revealed array is this tile
        var newrev = [ reveal(i, j) ];

        function stepto(next_i, next_j) {
            newrev = newrev.concat( zerowalk(next_i, next_j) );
        }

        stepto(i - 1, j - 1); // TL
        stepto(i - 1, j - 0); // TC
        stepto(i - 1, j + 1); // TR
        stepto(i - 0, j - 1); // CL
        stepto(i - 0, j + 1); // CR
        stepto(i + 1, j - 1); // BL
        stepto(i + 1, j - 0); // BC
        stepto(i + 1, j + 1); // BR

        return newrev;
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
        if (!revealed[k]) {
            seq++;

            if (value === 0) {
                turn = (turn + 1) % 2;
                // The first zero must still be not revealed
                show = zerowalk(i, j);
            }
            else {
                // Revealed a non-zero value...
                revealed[k] = true;

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
                show = show.concat( revealall() );
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