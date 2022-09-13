import showTurn from './show-turn.js';
import showScores from './show-scores.js';
import showWinner from './show-winner.js';
import showStatus from './show-status.js';
import autoplay from './autoplay.js';

const handlers = {
    online:
    function(message) {
        // unused
    },

    join:
    function(message, $, controls, canvas, gamestate, socket, boardclicks) {
        if (message.status === 'OPEN') {
            gamestate.playingAs = message.playing_as;
            gamestate.turn = 0;

            // wait for the game-start message
            showStatus('waiting', canvas, boardclicks); 

            if (Number(gamestate.playingAs) === 0) {
                $('#player-0-score-box').addClass('playing-as');
            }
            else if (Number(gamestate.playingAs) === 1) {
                $('#player-1-score-box').addClass('playing-as');
            }
        }
        else {
            // nobody to play with...
            showStatus('busy', canvas, boardclicks);
        }
    },

    start:
    function(message, $, controls, canvas, gamestate, socket, boardclicks) {
        showStatus('start', canvas, boardclicks);

        $('#player-0-score-box').addClass('active-turn');
        $('#turn-score-container').removeClass('not-playing');

        showTurn(gamestate, canvas, boardclicks);
    },

    'opponent-disconnected':
    function(message, $, controls, canvas, gamestate, socket, boardclicks) {
        showStatus('opponent-disconnected', canvas, boardclicks);
    },

    reveal:
    function(message, $, controls, canvas, gamestate, socket, boardclicks) {
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
            canvas.setvalue(item.i, item.j, item.value, item.owner);
            canvas.at(item.i, item.j).erase('guide');
        });

        const selected = message.for;
        canvas.select(selected.i, selected.j);

        showScores(revealed.score);

        // The game is still on
        if (revealed.on) {
            showTurn(gamestate, canvas, boardclicks);

            if (controls.autoplay) {
                // React even if it's the opponent's turn
                autoplay.solverscan(gamestate, canvas);
                if (gamestate.turn === gamestate.playingAs) {
                    // Select either a known,hidden flag or a random tile
                    autoplay.select_next_unrevealed_flag(gamestate, socket);
                }
            }
        }
        // Game is over
        else {
            gamestate.winner = gamestate.turn;
            showWinner(gamestate, canvas, boardclicks);
        }
    },
};

export default
function handleMessage(message, $, controls, canvas, gamestate, socket, boardclicks) {
    // If the event/message type is not recognized, discard/ignore it
    if (!Object.keys(handlers).includes(message.type)) return;

    // call the appropriate handler
    handlers[message.type](message, $, controls, canvas, gamestate, socket, boardclicks);
}