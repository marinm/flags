export default
function ScoreBox($, selectors) {

    return {
        set:
        function(scores) {
            $(selectors[0]).text(scores[0]);
            $(selectors[1]).text(scores[1]);
        },

        off:
        function() {
            $('#turn-score-container').addClass('not-playing');
        },

        on:
        function() {
            $('#turn-score-container').removeClass('not-playing');
        },

        showTurn:
        function(turn) {
            // Do nothing
        },

        setWinningScore:
        function(winningScore) {
            $('.winning-score').text(' / ' + winningScore);
        }
    }
}