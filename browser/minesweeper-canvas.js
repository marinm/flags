// Canvas drawing
// Model-[View]-Controller

// Flag icon made by Freepik from www.flaticon.com
// https://www.flaticon.com/free-icon/flag_94182

const DISABLED_HUE = 'rgba(200, 200, 200, 0.5)';

const TILESHEET = {
  img: new Image(),
  tiles: {
    'CHECKER-DARK':   [2,1],
    'CHECKER-LIGHT':  [2,0],
    'OUTLINE':        [2,2],
    'A':              [1,0],
    'B':              [1,1],
    '0':              [0,0],
    '1':              [0,1],
    '2':              [0,2],
    '3':              [0,3],
    '4':              [0,4],
    '5':              [0,5],
    '6':              [0,6],
    '7':              [0,7],
    '8':              [0,8],
    'NOFLAG':         [2,3],
    'FLAGHERE':       [2,4],
  }
};

// Turn a <canvas> into a tiled N-by-M board.
// In fancier terms, partitions the coordinate system.
//
//      WWWWWWW
//         0     1     2     3     4     5
//      +-----+-----+-----+-----+-----+-----+  H
//   0  |     |     |     |     |     |     |  H
//      +-----+-----+-----+-----+-----+-----+  H
//   1  |     |     |     |     |     |     |
//      +-----+-----+-----+-----+-----+-----+
//   2  |     |     |     |     |     |     |
//      +-----+-----+-----+-----+-----+-----+
//   3  |     |     |     |     |     |     |
//      +-----+-----+-----+-----+-----+-----+
//   4  |     |     |     |     |     |     |
//      +-----+-----+-----+-----+-----+-----+
//   5  |     |     |     |     |     |     |
//      +-----+-----+-----+-----+-----+-----+
//
// Clicking anywhere inside tile (i,j) triggers a custom callback(i,j).
//
// Usage:
//
//     <canvas id="game-board"></canvas>
//
//     <script type="text/javascript">
//         const board = new CanvasTiles('game-board', 6, 6, 20, 20, reportClick);
//
//         function reportClick(i, j) {
//             console.log(i, j);
//         }
//     </script>


// Assume arguments make sense.
// No safety checks.
function CanvasTiles(N, M, W, H, sheet, onclick) {
  // W,H are tile width,height

  const canvas = document.createElement('canvas');

  canvas.innerHTML = "Your browser does not support HTML5 canvas";

  canvas.setAttribute('width', M * W);
  canvas.setAttribute('height', N * H);

  const surface = canvas.getContext('2d');
  var disabled = false;

  const tiles = new Array(N * M);

  function tile(i, j) {
    return (i >=0 && j >= 0 && i < N && j < M)
      ? tiles[i * M + j]
      : null;
  }

  function forEachTile(action) {
    for (var i = 0; i < N; i++) {
      for (var j = 0; j < M; j++) {
        action(i, j);
      }
    }
  }

  forEachTile(function(i, j) {
    const x = j * W;
    const y = i * H;

    var layers = new Array();

    function render(tilename) {
      const tile = sheet.tiles[tilename];
      const sx = tile[1] * W;
      const sy = tile[0] * H;
      surface.drawImage(sheet.img, sx, sy, W, H, x, y, W, H);
    }

    function redraw() {
      layers.forEach(function(item) {
        render(item.tilename);
      });
    }

    tiles[i * M + j] = {
      hidden: true,
      value: null,

      draw:
      function(name, tilename) {
        layers.push({name, tilename});
        render(tilename);
      },

      erase:
      function(name) {
        layers = layers.filter((item) => item.name != name);
        redraw();
      },
    };
  });

  function disable() {
    disabled = true;
  }
  function enable() {
    disabled = false;
  }

  const interface = { canvas, surface, N, M, W, H, tile, forEachTile, disable, enable };

  canvas.addEventListener('click', function(event) {
    if (!disabled) {
      const i = Math.floor(event.offsetY / H);
      const j = Math.floor(event.offsetX / W);
      onclick(interface, i, j);
    }
  });

  return interface;
}


//
// MinesweeperBoard
// Interface for drawing numbers and flags on the tiled canvas
function MinesweeperBoard(N, M, S, sheet, onclick) {

  // The view
  const board = new CanvasTiles(N, M, S, S, sheet, onclick);

  board.restart = function() {
    // Checkerboard pattern
    board.forEachTile(function(i,j) {
      // odd row & odd col  or  even row & even col
      const ee = (i % 2 === 0) && (j % 2 === 0); // even/even
      const oo = (i % 2 === 1) && (j % 2 === 1); // odd/odd
      const tilename = (ee || oo)? 'CHECKER-DARK' : 'CHECKER-LIGHT';
      board.tile(i, j).draw('checker', tilename);
    });
    board.enable();
  }

  board.setvalue = function(i, j, value) {

    board.tile(i,j).hidden = false;
    board.tile(i,j).value = value;

    // Assume valid value
    board.tile(i,j).draw('value', String(value));
  };

  const lastselect = {i: 0, j: 0};

  board.select = function(i, j) {
    board.tile(lastselect.i, lastselect.j).erase('outline');
    board.tile(i, j).draw('outline', 'OUTLINE');
    lastselect.i = i;
    lastselect.j = j;
  };

  // Prevent click callback
  board.showdisabled = function() {
    board.disable();

    // Draw hue layer
    board.surface.fillStyle = DISABLED_HUE;
    board.surface.fillRect(0, 0, board.M * board.W, board.N * board.H);
  };

  board.forEachTile(function(i,j) {
    //  Top/Centre/Bottom - Left/Centre/Right
    //
    //    T      TL TC TR
    //  L C R    CL CC CR
    //    B      BL BC BR

    board.tile(i,j).adjacent = function() {
      const TL = board.tile(i - 1, j - 1);
      const TC = board.tile(i - 1, j - 0);
      const TR = board.tile(i - 1, j + 1);
      const CL = board.tile(i - 0, j - 1);
      const CR = board.tile(i - 0, j + 1);
      const BL = board.tile(i + 1, j - 1);
      const BC = board.tile(i + 1, j - 0);
      const BR = board.tile(i + 1, j + 1);

      return [TL, TC, TR, CL, CR, BL, BC, BR];
    };
  })

  // Load the tilesheet...
  sheet.img.onload = function() {
    // Start with a fresh board
    board.restart();
  }
  sheet.img.src = 'tile-sheet.png'

  return board;
}
