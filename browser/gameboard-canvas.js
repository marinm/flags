// Canvas drawing
// Model-[View]-Controller

// FlagsBoard
// Interface for drawing numbers and flags on the tiled canvas

import CanvasTiles from './canvas-tiles.js';

const DISABLED_HUE = 'rgba(200, 200, 200, 0.5)';

export default
function GameboardCanvas(N, M, S, sheet) {

    const W = S;
    const H = S;

    let disabled = false;

    // The view
    const gameboardCanvas = CanvasTiles(N, M, W, H, sheet);

    function disable() {
        disabled = true;
    }

    function enable() {
        disabled = false;
    }

    function ready() {
        return !disabled;
    }

    function restart() {
        // Checkerboard pattern
        gameboardCanvas.forEach(function(i,j,tile) {
            // odd row & odd col  or  even row & even col
            const ee = (i % 2 === 0) && (j % 2 === 0); // even/even
            const oo = (i % 2 === 1) && (j % 2 === 1); // odd/odd
            const tilename = (ee || oo)? 'CHECKER-DARK' : 'CHECKER-LIGHT';
            gameboardCanvas.at(i, j).draw('checker', tilename);
        });
        enable();
    }

    function mapToTilename(value, owner) {
        return (value === 'F')? (owner || '*') : value;
    }

    function setvalue(i, j, value, owner) {
        gameboardCanvas.at(i,j).hidden = false;
        gameboardCanvas.at(i,j).value = value;

        // Assume valid value
        const tilename = mapToTilename(value, owner);
        gameboardCanvas.at(i,j).draw('value', tilename);
    }

    const lastselect = {i: 0, j: 0};

    function select(i, j) {
        gameboardCanvas.at(lastselect.i, lastselect.j).erase('outline');
        gameboardCanvas.at(i, j).draw('outline', 'OUTLINE');
        lastselect.i = i;
        lastselect.j = j;
    }

    // Prevent click callback
    function showdisabled() {
        disable();

        // Draw hue layer
        gameboardCanvas.surface.fillStyle = DISABLED_HUE;
        gameboardCanvas.surface.fillRect(0, 0, M * W, N * H);
    }

    gameboardCanvas.forEach(function(i,j,tile) {
        //  Top/Centre/Bottom - Left/Centre/Right
        //
        //    T      TL TC TR
        //  L C R    CL CC CR
        //    B      BL BC BR

        tile.adjacent = function() {
            const TL = gameboardCanvas.at(i - 1, j - 1);
            const TC = gameboardCanvas.at(i - 1, j - 0);
            const TR = gameboardCanvas.at(i - 1, j + 1);
            const CL = gameboardCanvas.at(i - 0, j - 1);
            const CR = gameboardCanvas.at(i - 0, j + 1);
            const BL = gameboardCanvas.at(i + 1, j - 1);
            const BC = gameboardCanvas.at(i + 1, j - 0);
            const BR = gameboardCanvas.at(i + 1, j + 1);

            return [TL, TC, TR, CL, CR, BL, BC, BR];
        };
    });

    // Load the tilesheet...
    sheet.img.onload = function() {
        // Start with a fresh board
        restart();
    }
    sheet.img.src = sheet.filepath;

    return {
        ...gameboardCanvas,
        restart,
        setvalue,
        select,
        showdisabled,
        disable,
        enable,
        ready,
    };
};