// Flags game generator
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

const HIDDEN_MINE = '*';
const PLAYER_FLAGS = ['A', 'B'];
const TURN_TIME_LIMIT = 5 * 1000;

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function generate_flags_board(N, M, R) {
  if (N < 2 || M < 2)
    return [];

  var board = new Array(N * M);

  // By default, all values zero
  board.fill(0);

  // Mark R random tiles as 'M'
  for (var r = 0; r < R; r++) {
    var i = 0;
    var j = 0;

    // If the i,j is already a mine, try again
    do {
      i = getRandomInt(N);
      j = getRandomInt(M);
    }
    while (board[i*M + j] === HIDDEN_MINE);

    board[i * M + j] = HIDDEN_MINE;
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
      if (board[i * M + j] != HIDDEN_MINE)
        continue;

      //  Top/Centre/Bottom - Left/Centre/Right
      //
      //    T      TL TC TR
      //  L   R    CL -- CR
      //    B      BL BC BR

      function increment(i_,j_) {
        if ( (i_ >= 0 && i_ < N) && (j_ >= 0 && j_ < M) && board[i_ * M + j_] != HIDDEN_MINE) {
          board[i_ * M + j_]++;
        }
      }

      increment(i - 1, j - 1); // TL
      increment(i - 1, j - 0); // TC
      increment(i - 1, j + 1); // TR
      increment(i - 0, j - 1); // CL
      increment(i - 0, j + 1); // CR
      increment(i + 1, j - 1); // BL
      increment(i + 1, j - 0); // BC
      increment(i + 1, j + 1); // BR
    }
  }
  
  return board;
}

function FlagsGame(N, M, R) {
  // A randomly generated board
  const board = generate_flags_board(N, M, R);

  var turn = 0;
  var score = [0, 0];
  var seq = 0;
  var on = true;
  var turn_timer = null;
  var turn_timeout = null;

  // The game is over when a player finds R/2 mines
  const winning_score = Math.ceil(R/2);

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

  // Reveal all remaining hidden tiles
  // Should only be called when game is over
  function revealall() {
    if (on) {
      return null;
    }

    const remaining = [];
    for (var i = 0; i < N; i++) {
      for (var j = 0; j < M; j++) {
        // A failed get() indicates an unrevealed tile
        if (get(i,j) === null) {
          remaining.push( reveal(i, j) );
        }
      }
    }
    return remaining;
  }

  function zerowalk(i, j) {
    // The first zero must still be not revealed

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

    // Stepped to a mine
    // Don't reveal it
    if (value === HIDDEN_MINE)
      return [];

    // Stepped to a non-zero numeric tile
    // Reveal it and return the value
    if (value != '0')
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
    // Selected coordinates out of bounds
    if (!checkij(i,j))
      return null;
    
    // The game is already over
    if (!on)
      return null;

    const k = i * M + j;
    var value = board[k];

    // Which tiles to reveal, if any
    var show = [];

    // If the tile is already revealed, do nothing
    if (!revealed[k]) {
      seq++;

      if (value === 0) {
        turn = (turn + 1) % 2;
        // The first zero must still be not revealed
        show = zerowalk(i, j);
      }
      else {
        // Revealed a non-zero value...
        revealed[k] = true;

        if (value === HIDDEN_MINE) {
          // Change the tile value from HIDDEN_MINE to A/B
          board[k] = PLAYER_FLAGS[turn];
          value = board[k];

          // Still the same player's turn
          score[turn]++;

          on = (score[turn] < winning_score);
        }
        else {
          turn = (turn + 1) % 2;
        }
        show = [{i, j, value}];
      }

      // The game is over on this move
      // Append all unrevealed values
      if (!on) {
        show = show.concat( revealall() );
      }
    }

    reset_turn_timer();

    return { show, turn, score, on };
  }

  function getstate() {
    return { turn, score, seq, on };
  }

  function reset_turn_timer() {
    clearInterval(turn_timer);
    turn_timer = setInterval(function() {
      // Change turns
      turn = (turn + 1) % 2;

      // Callback
      turn_timeout();
    }, TURN_TIME_LIMIT);
  }

  function set_turn_timeout(f) {
    turn_timeout = f;
  }

  return { N, M, R, board, get, select, getstate, set_turn_timeout };
}

module.exports = FlagsGame;