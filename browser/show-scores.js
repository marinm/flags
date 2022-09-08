import $ from './fake-jquery.js';

export default
function showScores(scores) {
    $('#player-0-score').text(scores[0]);
    $('#player-1-score').text(scores[1]);
};