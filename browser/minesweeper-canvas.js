// Canvas drawing
// Model-[View]-Controller

const CHECKER_DARK = '#f9f9f9';
const CHECKER_LIGHT = '#ffffff';
const DISABLED_HUE = 'rgba(200, 200, 200, 0.5)';
const OUTLINE_COLR = '#ffa500';

function preloaded(src) {
  const img = new Image();
  img.src = src;
  return img;
}

// Flag icon made by Freepik from www.flaticon.com
// https://www.flaticon.com/free-icon/flag_94182
const TILE_IMAGES = {
  'CHECKER-DARK':   preloaded('tiles/checker-dark.png'),
  'CHECKER-LIGHT':  preloaded('tiles/checker-light.png'),
  'OUTLINE':        preloaded('tiles/outline.png'),
  'A':              preloaded('tiles/A.png'),
  'B':              preloaded('tiles/B.png'),
  '0':              preloaded('tiles/0.png'),
  '1':              preloaded('tiles/1.png'),
  '2':              preloaded('tiles/2.png'),
  '3':              preloaded('tiles/3.png'),
  '4':              preloaded('tiles/4.png'),
  '5':              preloaded('tiles/5.png'),
  '6':              preloaded('tiles/6.png'),
  '7':              preloaded('tiles/7.png'),
  '8':              preloaded('tiles/8.png'),
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
function CanvasTiles(N, M, W, H, onclick) {
  // W,H are tile width,height

  const canvas = document.createElement('canvas');

  canvas.innerHTML = "Your browser does not support HTML5 canvas";

  canvas.setAttribute('width', M * W);
  canvas.setAttribute('height', N * H);

  const surface = canvas.getContext('2d');
  var disabled = false;

  const tiles = new Array(N * M);

  function tile(i, j) {
    return tiles[i * M + j];
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

    function render(img) {
      surface.drawImage(img, x, y);
    }

    function redraw() {
      layers.forEach(function(item) {
        render(item.src);
      });
    }

    tiles[i * M + j] = {
      hidden: true,
      value: null,

      draw:
      function(name, src) {
        layers.push({name, src});
        render(src);
      },

      erase:
      function(name) {
        layers = layers.filter((item) => item.name != name);
        redraw();
      }
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
function MinesweeperBoard(N, M, S, onclick) {

  // The view
  const board = new CanvasTiles(N, M, S, S, onclick);

  board.restart = function() {
    // Checkerboard pattern
    board.forEachTile(function(i,j) {
      // odd row & odd col  or  even row & even col
      const ee = (i % 2 === 0) && (j % 2 === 0); // even/even
      const oo = (i % 2 === 1) && (j % 2 === 1); // odd/odd
      const tileimg = (ee || oo)? 'CHECKER-DARK' : 'CHECKER-LIGHT';
      board.tile(i, j).draw('checker', TILE_IMAGES[tileimg]);
    });
    board.enable();
  }

  board.setvalue = function(i, j, value) {

    board.tile(i,j).hidden = false;
    board.tile(i,j).value = value;

    // Assume valid value
    board.tile(i,j).draw('value', TILE_IMAGES[String(value)]);
  };

  const lastselect = {i: 0, j: 0};

  board.select = function(i, j) {
    board.tile(lastselect.i, lastselect.j).erase('outline');
    board.tile(i, j).draw('outline', TILE_IMAGES['OUTLINE']);
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

  // Start with a fresh board
  board.restart();

  return board;
}
