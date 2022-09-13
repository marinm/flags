import showStatus from './show-status.js';

export default
function showTurn(gamestate, notebox, gameboardCanvas, boardClicks) {
    const status = (gamestate.playingAs === gamestate.turn)
        ? 'your-turn'
        : 'opponents-turn';
    showStatus(status, notebox, gameboardCanvas, boardClicks);
};