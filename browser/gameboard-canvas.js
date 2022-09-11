// Canvas drawing
// Model-[View]-Controller

// FlagsBoard
// Interface for drawing numbers and flags on the tiled canvas

import CanvasTiles from './canvas-tiles.js';

const DISABLED_HUE = 'rgba(200, 200, 200, 0.5)';

export default
function GameboardCanvas(N, M, S, sheet) {

    let disabled = false;

    function disable() {
        disabled = true;
    }

    function enable() {
        disabled = false;
    }

    function ready() {
        return !disabled;
    }

    // The view
    const gameboardCanvas = new CanvasTiles(N, M, S, S, sheet);

    gameboardCanvas.disable = disable;
    gameboardCanvas.enable = enable;
    gameboardCanvas.ready = ready;

    gameboardCanvas.restart = function() {
        // Checkerboard pattern
        gameboardCanvas.forEachTile(function(i,j,tile) {
            // odd row & odd col  or  even row & even col
            const ee = (i % 2 === 0) && (j % 2 === 0); // even/even
            const oo = (i % 2 === 1) && (j % 2 === 1); // odd/odd
            const tilename = (ee || oo)? 'CHECKER-DARK' : 'CHECKER-LIGHT';
            gameboardCanvas.tile(i, j).draw('checker', tilename);
        });
        enable();
    }

    function mapToTilename(value, owner) {
        return (value === 'F')? (owner || '*') : value;
    }

    gameboardCanvas.setvalue = function(i, j, value, owner) {
        gameboardCanvas.tile(i,j).hidden = false;
        gameboardCanvas.tile(i,j).value = value;

        // Assume valid value
        const tilename = mapToTilename(value, owner);
        gameboardCanvas.tile(i,j).draw('value', tilename);
    };

    const lastselect = {i: 0, j: 0};

    gameboardCanvas.select = function(i, j) {
        gameboardCanvas.tile(lastselect.i, lastselect.j).erase('outline');
        gameboardCanvas.tile(i, j).draw('outline', 'OUTLINE');
        lastselect.i = i;
        lastselect.j = j;
    };

    // Prevent click callback
    gameboardCanvas.showdisabled = function() {
        disable();

        // Draw hue layer
        gameboardCanvas.surface.fillStyle = DISABLED_HUE;
        gameboardCanvas.surface.fillRect(0, 0, gameboardCanvas.M * gameboardCanvas.W, gameboardCanvas.N * gameboardCanvas.H);
    };

    gameboardCanvas.forEachTile(function(i,j,tile) {
        //  Top/Centre/Bottom - Left/Centre/Right
        //
        //    T      TL TC TR
        //  L C R    CL CC CR
        //    B      BL BC BR

        tile.adjacent = function() {
            const TL = gameboardCanvas.tile(i - 1, j - 1);
            const TC = gameboardCanvas.tile(i - 1, j - 0);
            const TR = gameboardCanvas.tile(i - 1, j + 1);
            const CL = gameboardCanvas.tile(i - 0, j - 1);
            const CR = gameboardCanvas.tile(i - 0, j + 1);
            const BL = gameboardCanvas.tile(i + 1, j - 1);
            const BC = gameboardCanvas.tile(i + 1, j - 0);
            const BR = gameboardCanvas.tile(i + 1, j + 1);

            return [TL, TC, TR, CL, CR, BL, BC, BR];
        };
    });

    // Load the tilesheet...
    sheet.img.onload = function() {
        // Start with a fresh board
        gameboardCanvas.restart();
    }
    sheet.img.src = sheet.filepath;

    return gameboardCanvas;
};