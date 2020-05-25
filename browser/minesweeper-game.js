// Minesweeper game generator
// [Model]-View-Controller
//
// Randomly generates a board
// Maintains game state - what has been revealed so far
//
// A 6x6 board example:
//
//                          M
//           0     1     2     3     4     5    j
//        +-----+-----+-----+-----+-----+-----+
//     0  |  1  |  2  |  *  |  1  |  1  |  1  |
//        +-----+-----+-----+-----+-----+-----+
//     1  |  1  |  *  |  2  |  1  |  1  |  *  |
//        +-----+-----+-----+-----+-----+-----+
//     2  |  1  |  1  |  1  |  1  |  2  |  1  |
//  N     +-----+-----+-----+-----+-----+-----+
//     3  |  0  |  0  |  1  |  *  |  1  |  0  |
//        +-----+-----+-----+-----+-----+-----+
//     4  |  1  |  2  |  3  |  2  |  1  |  0  |
//        +-----+-----+-----+-----+-----+-----+
//     5  |  1  |  *  |  *  |  1  |  0  |  0  |
//        +-----+-----+-----+-----+-----+-----+
//     i

const MINE_MARK = '*';

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function generate_minesweeper_board(N, M, R) {
  if (N < 2 || M < 2)
    return [];

  var board = new Array(N * M);

  // By default, all values zero
  board.fill(0);

  // Mark R random tiles as 'M'
  for (var r = 0; r < R; r++) {
    var i = getRandomInt(N);
    var j = getRandomInt(M);

    board[i * M + j] = MINE_MARK;
  }

  // Walk through the board, by row and column.
  // If the tile is marked as a mine, increment the numeric value of all
  // non-mine tiles it touches.
  //
  // For each row...
  for (var i = 0; i < N; i++) {
    // For each column...
    for (var j = 0; j < M; j++) {
      // If tile (i,j) is not a Mine, skip it
      if (board[i*M + j] != MINE_MARK)
        continue;

      //  Top/Centre/Bottom - Left/Centre/Right
      //
      //    T      TL TC TR
      //  L C R    CL CC CR
      //    B      BL BC BR

      // Transform the 2d [i,j] into a 1d [k], or k=-1 if not accessible

      // This looks messy but it's simple.
      // Check if T/B/L/R are accessible and transform [i,j] to flat [k].

      //     k = (      accessible      ) ?  (     transform     )  : -1;
      //         -------------------------------------------------------
      const TL = ( i > 0    &&  j > 0   ) ?  (i - 1) * M + (j - 1)  : -1;
      const TC = ( i > 0                ) ?  (i - 1) * M + (j - 0)  : -1;
      const TR = ( i > 0    &&  j < M-1 ) ?  (i - 1) * M + (j + 1)  : -1;
      const CL = (              j > 0   ) ?  (i - 0) * M + (j - 1)  : -1;
      const CR = (              j < M-1 ) ?  (i - 0) * M + (j + 1)  : -1;
      const BL = ( i < N-1  &&  j > 0   ) ?  (i + 1) * M + (j - 1)  : -1;
      const BC = ( i < N-1              ) ?  (i + 1) * M + (j - 0)  : -1;
      const BR = ( i < N-1  &&  j < M-1 ) ?  (i + 1) * M + (j + 1)  : -1;
      const CC =                             (i - 0) * M + (j - 0)      ;

      function increment(k) {
        if (k != -1 && board[k] != MINE_MARK)
          board[k] = board[k] + 1;
      }

      increment(TL);
      increment(TC);
      increment(TR);
      increment(CL);
      increment(CR);
      increment(BL);
      increment(BC);
      increment(BR);
      increment(CC);
    }
  }

  return board;
}

function MinesweeperGame(N, M, R) {
  // A randomly generated board
  const board = generate_minesweeper_board(N, M, R);

  // What has been revealed so far (array of bools)
  const revealed = new Array(N * M);
  revealed.fill(false);

  function checkij(i, j) {
    return (i >= 0 && j >= 0 && i < N && j < M);
  }

  function get(i, j) {
    const k = i * M + j;
    if (!checkij(i,j) || !revealed[k])
      return null;
    return board[k];
  }

  function reveal(i, j) {
    const k = i * M + j;
    revealed[k] = true;
    const value = board[k];
    return {i, j, value};
  }

  function zerowalk(i, j) {

    // Stepped out of bounds
    // Nothing to do
    if (!checkij(i,j))
      return [];

    const k = i * M + j;

    // Stepped to a value that's already been revealed
    // Nothing to do
    if (revealed[k])
      return [];

    const value = board[k];

    // Stepped to a non-zero numeric tile
    // Reveal it and return the value
    if (value != '0' && value != MINE_MARK)
      return [ reveal(i, j) ];

    // Found a zero...
    // First item on the newly revealed array is this tile
    var newrev = [ reveal(i, j) ];

    function stepto(next_i, next_j) {
      newrev = newrev.concat( zerowalk(next_i, next_j) );
    }

    stepto(i - 1, j - 1); // TL
    stepto(i - 1, j - 0); // TC
    stepto(i - 1, j + 1); // TR
    stepto(i - 0, j - 1); // CL
    stepto(i - 0, j + 1); // CR
    stepto(i + 1, j - 1); // BL
    stepto(i + 1, j - 0); // BC
    stepto(i + 1, j + 1); // BR

    return newrev;
  }

  function select(i, j) {
    if (!checkij(i,j))
      return null;

    const k = i * M + j;

    // If the tile is already revealed, do nothing
    if (revealed[k])
      return [];

    if (board[k] != '0') {
      revealed[k] = true;
      const value = board[k];
      return [{i, j, value}];
    }

    return zerowalk(i, j);
  }

  return { board, get, select };
}