function reveal(owner, i, j, revealed, board) {
    revealed.set(i, j, true);
    return {i, j, value: board.at(i,j), owner};
}

// Reveal all un-revealed tiles
// Should only be called when game is over
function revealAll(revealed, board) {
    return revealed
        // Get [i,j] coordinates of tiles that have not been revealed
        .filter( (i,j) => !revealed.at(i,j) )
        // Reveal those tiles and get an array of their reveal values
        .map( ([i,j]) => reveal(null, i, j, revealed, board) );
}

module.exports = { reveal, revealAll };