module.exports =
function zerowalk(tile) {

    // Stepped out of bounds
    // Nothing to do
    // (This should never happen...)
    if (!tile) return [];

    // Stepped to a tile that's already been revealed
    // Nothing to do
    if (tile.isRevealed()) return [];

    // Stepped to a flag
    // Don't reveal it
    if (tile.isFlag()) return [];

    // Stepped to a non-zero numeric tile
    // Reveal it and return the value
    if (tile.value() != 0) return [ tile.reveal() ];

    // Found a zero...
    // First item on the newly revealed array is this tile
    let show = [ tile.reveal() ];

    // Visit every neighbour and start a zerowalk from there
    // Recursive depth-first search
    // This might be bad for performance?
    // Can improve by using a queue traversal
    tile.neighbours().forEach(nb => show = show.concat(zerowalk(nb)));

    return show;
}