export default
function handle_reveal(
    message,
    controls,
    view,
    gamestate,
    socket,
    boardclicks,
    showTurn,
    showStatus,
    autoplay,
    selectTile
) {
    const revealed = message;
    if (!revealed) {
        // ... do something here
        // out-of-bounds or game already over
    }

    gamestate.turn = revealed.turn;

    revealed.show.forEach(function(item) {
        gamestate.board.set(item.i, item.j,
            {
                i      : item.i,
                j      : item.j,
                hidden : false,
                value  : item.value,
                owner  : item.owner,
            }
        );
        view.canvasboard.setvalue(item.i, item.j, item.value, item.owner);
        view.canvasboard.at(item.i, item.j).erase('guide');
    });

    const selected = message.for;
    view.canvasboard.select(selected.i, selected.j);

    view.scorebox.set(revealed.score);

    // The game is still on
    if (revealed.on) {
        showTurn(gamestate, view, boardclicks);

        if (controls.autoplay) {
            // React even if it's the opponent's turn
            autoplay.solverscan(gamestate, view.canvasboard);
            if (gamestate.turn === gamestate.playingAs) {
                // Select either a known,hidden flag or a random tile
                autoplay.select_next_unrevealed_flag({gamestate, selectTile, socket});
            }
        }
    }
    // Game is over
    else {
        gamestate.winner = gamestate.turn;
        showStatus('winner', view, boardclicks);
    }
};