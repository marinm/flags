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