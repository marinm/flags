const labels = require('./labels.js');
const forEachNeighbour = require('./for-each-neighbour.js');
const {reveal} = require('./reveal.js');

module.exports =
function zerowalk(i, j, board, revealed) {
    // Stepped out of bounds
    // Nothing to do
    if (!board.contains(i,j)) return [];

    // Stepped to a tile that's already been revealed
    // Nothing to do
    if (revealed.at(i,j)) return [];

    // Stepped to a flag
    // Don't reveal it
    if (board.at(i,j) === labels.HIDDEN_FLAG) return [];

    // Stepped to a non-zero numeric tile
    // Reveal it and return the value
    if (board.at(i,j) != 0) return [ reveal(i, j, revealed, board) ];

    // Found a zero...
    // First item on the newly revealed array is this tile
    let newrev = [ reveal(i, j, revealed, board) ];

    // Recursive depth-first search
    // This might be bad for performance?
    // Can improve by using a queue traversal
    function stepto(next_i, next_j) {
        newrev = newrev.concat( zerowalk(next_i, next_j, board, revealed) );
    }

    forEachNeighbour(i, j, stepto, null);

    return newrev;
}