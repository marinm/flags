import {Tile} from '../game/tile.js';
import {Grid} from '../game/grid.js';

// Turns a <canvas> into a grid of clickable rectangular tiles.
// Clicking anywhere inside tile (i,j) triggers a custom callback(i,j).
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

export
function CanvasTiles(params) {

    const canvas      = params.canvasElement;
    const numRows     = params.board.numRows;
    const numColumns  = params.board.numColumns;
    const tileWidth   = params.canvas.tileWidth;
    const tileHeight  = params.canvas.tileHeight;
    const tilesheet   = params.tilesheet;

    const surface     = canvas.getContext('2d');
    const sheetImage  = new Image();

    sheetImage.onload = params.onReady;
    sheetImage.src    = params.tilesheet.filepath;

    canvas.setAttribute('width', numColumns * tileWidth);
    canvas.setAttribute('height', numRows * tileHeight);

    return {
        ...Grid(numRows, numColumns),

        surface:
        function() {
            return surface;
        },

        CanvasBoardTile:
        function(i, j) {
            // Top left corner pixel coordinates
            const x = j * tileWidth;
            const y = i * tileHeight;

            let layers = new Array();

            return {
                render:
                function(tilename) {
                    const tileSlot = tilesheet.tiles[tilename];

                    // Do nothing for non-existant tilename
                    if (!tileSlot) return;

                    const sheetX = tileSlot[1] * tilesheet.tileWidth;
                    const sheetY = tileSlot[0] * tilesheet.tileHeight;
                    surface.drawImage(
                        sheetImage,
                        sheetX, sheetY, tilesheet.tileWidth, tilesheet.tileHeight,
                        x, y, tileWidth, tileHeight
                    );
                },

                draw:
                function(layerName, tilename) {
                    layers.push({name: layerName, tilename});
                    this.render(tilename);
                },

                redraw:
                function() {
                    layers.forEach( item => this.render(item.tilename) );
                },

                clear:
                function() {
                    surface.clearRect(x, y, tileWidth, tileHeight);
                },

                eraseLayer:
                function(name) {
                    layers = layers.filter(layer => layer.name != name);
                    this.clear();
                    this.redraw();
                }
            };
        },

        onclick:
        function(callback) {
            const canvasBoard = this;
            canvas.addEventListener('click', function(event) {
                const i = Math.floor(event.offsetY / tileHeight);
                const j = Math.floor(event.offsetX / tileWidth);
                callback(i, j, canvasBoard.at(i, j));
            });
        }
    };
};