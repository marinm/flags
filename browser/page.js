
const BOARD_N = 24;
const BOARD_M = 24;
const BOARD_R = 96;
const PLAY_UNTIL = 48;
const BOARD_CELLSIZE = 24;

const board = new FlagsBoard(BOARD_N, BOARD_M, BOARD_CELLSIZE, TILESHEET, report_click);

$('#board-container').append(board.canvas);

$('.remaining').text(' / ' + PLAY_UNTIL);