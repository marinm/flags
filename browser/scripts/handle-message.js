import handle_online from './handle-online.js';
import handle_join from './handle-join.js';
import handle_start from './handle-start.js';
import handle_opponent_disconnected from './handle-opponent-disconnected.js';
import handle_reveal from './handle-reveal.js';

const handlers = {
    'online'                : handle_online,
    'join'                  : handle_join,
    'start'                 : handle_start,
    'opponent-disconnected' : handle_opponent_disconnected,
    'reveal'                : handle_reveal,
};

export default
function handleMessage(
    message,
    $,
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
    const handler = handlers[message.type];

    handler?.(
        message,
        $,
        controls,
        view,
        gamestate,
        socket,
        boardclicks,
        showTurn,
        showStatus,
        autoplay,
        selectTile
    );
}