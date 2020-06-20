// Canvas drawing
// Model-[View]-Controller

const CHECKER_DARK = '#f9f9f9';
const CHECKER_LIGHT = '#ffffff';
const DISABLED_HUE = 'rgba(200, 200, 200, 0.5)';
const OUTLINE_COLR = '#ffa500';

// Flag icon made by Freepik from www.flaticon.com
// https://www.flaticon.com/free-icon/flag_94182
const PLAYER_FLAGS_IMG = ['player_flag_0.svg', 'player_flag_1.svg'];



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

    function stackdraw(name, f) {
      return function(args) {
        layers.push({name, f, args});
        f(args);
      }
    }

    function redraw() {
      layers.forEach(function(item) {
        item.f(item.args);
      });
    }

    function eraselayer(name) {
      layers = layers.filter((item) => item.name != name);
      redraw();
    }

    tiles[i * M + j] = {
      fill:
      stackdraw('fill', function(args) {
        surface.fillStyle = args.colour;
        surface.fillRect(x, y, W, H);
      }),

      outline:
      stackdraw('outline', function(args) {
        surface.strokeStyle = args.colour;
        surface.lineWidth = 2;
        surface.strokeRect(x + 1, y + 1, W - 2, H - 2)
      }),

      text:
      stackdraw('text', function(args) {
        const font_size = Math.floor(0.7 * W);
    
        surface.fillStyle = args.colour;
        surface.font = 'bold ' + font_size + 'px arial';
        surface.textBaseline = 'top';
        const metrics = surface.measureText(args.str);
        const ch_width = metrics.width;
        const ch_height = metrics.actualBoundingBoxDescent;
    
        const text_x = x + (0.5 * (W - ch_width));
        const text_y = y + (0.5 * (H - ch_height));
        surface.fillText(args.str, text_x, text_y);
      }),

      renderimage:
      stackdraw('renderimage', function(args) {
        var img = new Image();
        img.onload = function() {
          const img_x = x + (0.5 * (W - img.width));
          const img_y = y + (0.5 * (H - img.height));
          surface.drawImage(img, img_x, img_y);
        }
        img.src = args.src;
      }),

      erase:
      eraselayer,
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
      const colour = (ee || oo)? CHECKER_DARK : CHECKER_LIGHT;
      board.tile(i, j).fill({colour});
    });
    board.enable();
  }

  board.setvalue = function(i, j, value) {
    var colour = null;
    switch (value) {
      case 0: colour = '#eeeeee';  break;
      case 1: colour = '#0000ff';  break;
      case 2: colour = '#107118';  break;
      case 3: colour = '#ff00ff';  break;
      case 4: colour = '#ff0000';  break;
      case 5: colour = '#ff0000';  break;
      case 6: colour = '#ff0000';  break;
      case 7: colour = '#ff0000';  break;
      case 8: colour = '#ff0000';  break;
      default: colour = '#ff0000';  break;
    }

    const str = value;

    switch (value) {
      case 'A':  board.tile(i,j).renderimage({src: PLAYER_FLAGS_IMG[0]}); break;
      case 'B':  board.tile(i,j).renderimage({src: PLAYER_FLAGS_IMG[1]}); break;
      default:   board.tile(i,j).text({str, colour});
    }
  };

  const lastselect = {i: 0, j: 0};

  board.select = function(i, j) {
    board.tile(lastselect.i, lastselect.j).erase('outline');
    board.tile(i, j).outline({colour: OUTLINE_COLR});
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
