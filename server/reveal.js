// Reveal all un-revealed tiles
// Should only be called when game is over
function revealAll(board) {
    return board.filter(t => !t.isRevealed()).map(t => t.reveal());
}

module.exports = { revealAll };