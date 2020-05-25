// Canvas drawing
// Model-[View]-Controller

const CHECKER_DARK = '#f9f9f9';
const CHECKER_LIGHT = '#ffffff';

// Flag icon made by Freepik from www.flaticon.com
// https://www.flaticon.com/free-icon/flag_94182
const PLAYER_FLAGS = ['player_flag_0.svg', 'player_flag_1.svg'];

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

  canvas.setAttribute('width', M * W);
  canvas.setAttribute('height', N * H);

  const surface = canvas.getContext('2d');

  function forEachTile(action) {
    for (var i = 0; i < N; i++) {
      for (var j = 0; j < M; j++) {
        action(i, j);
      }
    }
  }

  function fill(i, j, colour) {
    surface.fillStyle = colour;
    const x = j * W;
    const y = i * H;
    surface.fillRect(x, y, W, H);
  }

  function text(i, j, str, colour) {
    const tile_x = j * W;
    const tile_y = i * H;
    const font_size = Math.floor(0.7 * W);

    surface.fillStyle = colour;
    surface.font = 'bold ' + font_size + 'px arial';
    surface.textBaseline = 'top';
    const metrics = surface.measureText(str);
    const ch_width = metrics.width;
    const ch_height = metrics.actualBoundingBoxDescent;

    const text_x = tile_x + (0.5 * (W - ch_width));
    const text_y = tile_y + (0.5 * (H - ch_height));
    surface.fillText(str, text_x, text_y);
  }

  function renderimage(i, j, src) {
    var img = new Image();
    img.onload = function() {
      const tile_x = j * W;
      const tile_y = i * H;
      const img_x = tile_x + (0.5 * (W - img.width));
      const img_y = tile_y + (0.5 * (H - img.height));
      surface.drawImage(img, img_x, img_y);
    }
    img.src = src;
  }

  const interface = { canvas, surface, N, M, W, H, forEachTile, fill, text, renderimage };

  canvas.addEventListener('click', function(event) {
      const i = Math.floor(event.offsetY / H);
      const j = Math.floor(event.offsetX / W);
      onclick(interface, i, j);
  });

  return interface;
}


//
// MinesweeperBoard
// Interface for drawing numbers and flags on the tiled canvas
function MinesweeperBoard(N, M, S, onclick) {

  // The view
  const board = new CanvasTiles(N, M, S, S, onclick);

  // Checkerboard pattern
  board.forEachTile(function(i,j) {
    // odd row & odd col  or  even row & even col
    const ee = (i % 2 === 0) && (j % 2 === 0); // even/even
    const oo = (i % 2 === 1) && (j % 2 === 1); // odd/odd
    const colour = (ee || oo)? CHECKER_DARK : CHECKER_LIGHT;
    board.fill(i, j, colour);
  });

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

    switch (value) {
      case 'PLAYER_FLAG_0':  board.renderimage(i, j, PLAYER_FLAGS[0]); break;
      case 'PLAYER_FLAG_1':  board.renderimage(i, j, PLAYER_FLAGS[1]); break;
      default:               board.text(i, j, value, colour);
    }
  }

  return board;
}
