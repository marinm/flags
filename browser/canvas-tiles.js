// Turn a <canvas> into a tiled N-by-M board.
// 
//
//         0     1     2     3     4     5
//      +-----+-----+-----+-----+-----+-----+
//   0  |     |     |     |     |     |     |
//      +-----+-----+-----+-----+-----+-----+
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

import Matrix from './matrix.js';

export default
function CanvasTiles(N, M, W, H, sheet) {
    // Assume arguments make sense.
    // No safety checks.
    // W,H are tile width,height
  
    const canvas = document.createElement('canvas');
  
    canvas.innerHTML = "Your browser does not support HTML5 canvas";
  
    canvas.setAttribute('width', M * W);
    canvas.setAttribute('height', N * H);
  
    const surface = canvas.getContext('2d');
  
    const tiles = Matrix(N, M);
  
    tiles.fill(function(i, j) {
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

        return {
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
  
    // For temporary compatability
    function tile(i,j) { return tiles.at(i,j); }
    function forEachTile(action) { return tiles.forEach(action); }

    return {
        ...tiles,
        canvas, 
        surface
    };
}