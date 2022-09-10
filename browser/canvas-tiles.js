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
//
// Clicking anywhere inside tile (i,j) triggers a custom callback(i,j).

export default
function CanvasTiles(N, M, W, H, sheet, onclick) {
    // Assume arguments make sense.
    // No safety checks.
    // W,H are tile width,height
  
    const canvas = document.createElement('canvas');
  
    canvas.innerHTML = "Your browser does not support HTML5 canvas";
  
    canvas.setAttribute('width', M * W);
    canvas.setAttribute('height', N * H);
  
    const surface = canvas.getContext('2d');
    var disabled = false;
  
    const tiles = new Array(N * M);
  
    function tile(i, j) {
        return (i >=0 && j >= 0 && i < N && j < M) ? tiles[i * M + j] : null;
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

    function ready() {
        return !disabled;
    }
  
    const methods = {
        canvas, 
        surface,
        N,
        M,
        W,
        H,
        tile,
        forEachTile,
        disable,
        enable,
        ready
    };

    canvas.addEventListener('click', function(event) {
        if (!disabled) {
            const i = Math.floor(event.offsetY / H);
            const j = Math.floor(event.offsetX / W);
            onclick(methods, i, j);
        }
    });

    return methods;
}