const zerowalk = require('./zerowalk.js');
const labels = require('./labels.js');
const {revealAll} = require('./reveal.js');

module.exports =
function select(i, j, F, counters, board, revealed) {

    // The game is over when a player finds F/2 flags
    const winning_score = Math.ceil(F/2);

    // Selected coordinates out of bounds
    if (!board.contains(i,j)) return null;

    // The game is already over
    if (!counters.on) return null;

    var value = board.at(i,j);

    // Which tiles to reveal, if any
    var show = [];

    // If the tile is already revealed, do nothing
    if (!revealed.at(i,j)) {
        counters.seq++;

        if (value === 0) {
            counters.turn = (counters.turn + 1) % 2;
            // The first zero must still be not revealed
            show = zerowalk(i, j, board, revealed);
        }
        else {
            // Revealed a non-zero value...
            revealed.set(i, j, true);

            if (value === labels.HIDDEN_FLAG) {
                // Change the tile value from HIDDEN_FLAG to PLAYER_FLAG
                board.set(i, j, labels.PLAYER_FLAGS[counters.turn]);
                value = board.at(i,j);

                // Still the same player's turn
                counters.score[counters.turn]++;

                counters.on = (counters.score[counters.turn] < winning_score);
            }
            else {
                counters.turn = (counters.turn + 1) % 2;
            }
            show = [{i, j, value}];
        }

        // The game is over on this move
        // Append all unrevealed values
        if (!counters.on) {
            show = show.concat( revealAll(revealed, board) );
        }
    }

    return { show, ...counters };
}