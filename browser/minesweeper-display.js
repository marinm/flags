const TMP_N = 24;
const TMP_M = 24;
const TMP_R = Math.floor((TMP_N + TMP_M) * 1.5);
const TMP_CELLSIZE = 24;

const CHECKER_DARK = '#f9f9f9';
const CHECKER_LIGHT = '#ffffff';

// The view
const board = new CanvasTiles('board', TMP_N, TMP_M, TMP_CELLSIZE, TMP_CELLSIZE, report_click);

// The game state
const game = new MinesweeperGame(TMP_N, TMP_M, TMP_R);

function report_click(i, j) {
  return new Promise(function(resolve, reject) {
    const revealed = game.select(i, j);
    revealed.forEach(function(item) {
      setvalue(item.i, item.j, item.value);
    });
    resolve(revealed);
  });
}

// Checkerboard pattern
board.forEachTile(function(i,j) {
  // odd row & odd col  or  even row & even col
  const ee = (i % 2 === 0) && (j % 2 === 0); // even/even
  const oo = (i % 2 === 1) && (j % 2 === 1); // odd/odd
  const colour = (ee || oo)? CHECKER_DARK : CHECKER_LIGHT;
  board.fill(i, j, colour);
});

function setvalue(i, j, value) {
  var colour = null;
  switch (String(value)) {
    case '*': colour = '#00ff00';  break;
    case '0': colour = '#eeeeee';  break;
    case '1': colour = '#0000ff';  break;
    case '2': colour = '#107118';  break;
    case '3': colour = '#ff00ff';  break;
    default : colour = '#ff0000';  break;
  }

  if (value === '*')
    // Flag icon made by Freepik from www.flaticon.com
    // https://www.flaticon.com/free-icon/flag_94182 
    board.renderimage(i, j, 'flag.svg');
  else
    board.text(i, j, value, colour);
}