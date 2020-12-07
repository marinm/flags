// Set up the page

const N_ROOMS = 8;

const TMP_N = 24;
const TMP_M = 24;
const TMP_R = Math.floor((TMP_N + TMP_M) * 2);
const TMP_CELLSIZE = 24;

const board = new FlagsBoard(TMP_N, TMP_M, TMP_CELLSIZE, TILESHEET, report_click);

$('#board-container').append(board.canvas);

const play_until = Math.ceil(TMP_R / 2);
$('.remaining').text(' / ' + play_until);