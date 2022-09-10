import showStatus from './show-status.js';

export default
function showTurn(gamestate, board) {
    const status = (gamestate.playingAs === gamestate.turn)
        ? 'your-turn'
        : 'opponents-turn';
    showStatus(status, board);
};