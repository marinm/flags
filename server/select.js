const zerowalk = require('./zerowalk.js');
const {reveal} = require('./reveal.js');

module.exports =
function select(i, j, board, revealed) {

    // Selected coordinates out of bounds, or
    // Selected tile that was already revealed
    // Return empty array
    if (!board.contains(i,j) || revealed.at(i,j))
        return [];

    // Special case: selecting a zero results in a "zero walk"
    // All other tiles only result in 1 reveal
    return (board.at(i,j) === 0) ? zerowalk(i, j, board, revealed)
        : [ reveal(i, j, revealed, board) ];
}