import showTurn from './show-turn.js';
import showStatus from './show-status.js';
import autoplay from './autoplay.js';

const handlers = {
    online:
    function(message) {
        // unused
    },

    join:
    function(message, $, controls, view, gamestate, socket, boardclicks) {
        if (message.status === 'OPEN') {
            gamestate.playingAs = message.playing_as;
            gamestate.turn = 0;

            // wait for the game-start message
            showStatus('waiting', view, boardclicks); 

            if (Number(gamestate.playingAs) === 0) {
                $('#player-0-score-box').addClass('playing-as');
            }
            else if (Number(gamestate.playingAs) === 1) {
                $('#player-1-score-box').addClass('playing-as');
            }
        }
        else {
            // nobody to play with...
            showStatus('busy', view, boardclicks);
        }
    },

    start:
    function(message, $, controls, view, gamestate, socket, boardclicks) {
        showStatus('start', view, boardclicks);

        $('#player-0-score-box').addClass('active-turn');
        $('#turn-score-container').removeClass('not-playing');

        showTurn(gamestate, view, boardclicks);
    },

    'opponent-disconnected':
    function(message, $, controls, view, gamestate, socket, boardclicks) {
        showStatus('opponent-disconnected', view, boardclicks);
    },

    reveal:
    function(message, $, controls, view, gamestate, socket, boardclicks) {
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
                    autoplay.select_next_unrevealed_flag(gamestate, socket);
                }
            }
        }
        // Game is over
        else {
            gamestate.winner = gamestate.turn;
            showStatus('winner', view, boardclicks);
        }
    },
};

export default
function handleMessage(
    message,
    $,
    controls,
    view,
    gamestate,
    socket,
    boardclicks
) {
    const handler = handlers[message.type];

    handler?.(
        message,
        $,
        controls,
        view,
        gamestate,
        socket,
        boardclicks
    );
}