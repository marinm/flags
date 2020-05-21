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
function CanvasTiles(id, N, M, W, H, onclick) {
  // W,H are tile width,height

  const board = document.getElementById(id);

  board.setAttribute('width', M * W);
  board.setAttribute('height', N * H);

  const surface = board.getContext('2d');

  board.addEventListener('click', function(event) {
      const i = Math.floor(event.offsetY / H);
      const j = Math.floor(event.offsetX / W);
      onclick(i, j);
  });

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

  return { surface, N, M, W, H, forEachTile, fill, text, renderimage };
}