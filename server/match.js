const randomBoard = require('./random-board.js');
const selectWithTurns = require('./select-with-turns.js');

module.exports =
function Match(N, M, F, W) {

    const counters = {
        turn  : 0,
        score : [0,0],
        seq   : 0,
        on    : true,
        luck  : [0,0],
    };

    // A randomly generated board
    const board = randomBoard(N, M, F);

    return {
        state  : () => counters,
        select : (i,j) => selectWithTurns(i, j, W, counters, board)
    };
}