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

    // For improvement:
    // Decide ownership outside of the game board
    owner = ['A','B'][counters.turn];
    console.log('owner ' + owner);

    // If the tile is already revealed, do nothing
    if (!revealed.at(i,j)) {
        counters.seq++;

        if (value === 0) {
            // The first zero must still be not revealed
            show = zerowalk(owner, i, j, board, revealed);

            // Revealed a number value (0)
            // Switch to next player's turn
            counters.turn = (counters.turn + 1) % 2;
        }
        else {
            // Revealed a non-zero value...
            revealed.set(i, j, true);

            if (value === labels.HIDDEN_FLAG) {
                // Still the same player's turn
                counters.score[counters.turn]++;

                counters.on = (counters.score[counters.turn] < winning_score);
            }
            else {
                // Revealed a number value
                // Switch to next player's turn
                counters.turn = (counters.turn + 1) % 2;
            }
            show = [{i, j, value, owner}];
        }

        // The game is over on this move
        // Append all unrevealed values
        if (!counters.on) {
            show = show.concat( revealAll(revealed, board) );
        }
    }

    return { show, ...counters };
}