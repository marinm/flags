import showStatus from './show-status.js';

export default
function showTurn(gamestate, board) {
    const status = (gamestate.player === gamestate.turn)
        ? 'your-turn'
        : 'opponents-turn';
    showStatus(status, board);
};