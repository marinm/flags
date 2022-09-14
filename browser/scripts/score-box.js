export default
function ScoreBox($, selectors) {
    return {
        set:
        function(scores) {
            $(selectors[0]).text(scores[0]);
            $(selectors[1]).text(scores[1]);
        },

        setWinningScore:
        function(winningScore) {
            $('.winning-score').text(' / ' + winningScore);
        }
    }
}