module.exports =
function zerowalk(tile) {

    const queue = [];
    const show = [];

    // Begin with this tile in the queue
    queue.push(tile);

    while (queue.length > 0) {
        // Pop the next tile from the queue
        const current = queue.shift();

        // Stepped to a tile that's already been revealed
        // Nothing to do
        if (current.isRevealed()) continue;

        // Stepped to a flag
        // Don't reveal it
        if (current.isFlag()) continue;

        // Stepped to numeric value
        // Reveal it
        show.push(current.reveal());

        // If this is a zero
        // Add all neighbours to the visit queue
        if (current.value() === 0) queue.push(...current.neighbours());

        // Some tiles will pass through the queue multiple times
    }

    return show;
}