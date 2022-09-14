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
function CanvasTiles(canvas, N, M, W, H, sheet) {
  
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

    return {
        ...tiles,
        canvas, 
        surface
    };
}