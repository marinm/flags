// Canvas drawing
// Model-[View]-Controller

// Flag icon made by Freepik from www.flaticon.com
// https://www.flaticon.com/free-icon/flag_94182

import CanvasTiles from './canvas-tiles.js';

const DISABLED_HUE = 'rgba(200, 200, 200, 0.5)';

const TILESHEET = {
  img: new Image(),
  tiles: {
    'CHECKER-DARK':   [2,1],
    'CHECKER-LIGHT':  [2,0],
    'OUTLINE':        [2,2],
    'A':              [1,0],
    'B':              [1,1],
    '0':              [0,0],
    '1':              [0,1],
    '2':              [0,2],
    '3':              [0,3],
    '4':              [0,4],
    '5':              [0,5],
    '6':              [0,6],
    '7':              [0,7],
    '8':              [0,8],
    'NOFLAG':         [2,3],
    'FLAGHERE':       [2,4],
    'NEXTSELECT':     [2,2],
    '*':              [1,2]
  }
};

//
// FlagsBoard
// Interface for drawing numbers and flags on the tiled canvas
function FlagsBoard(N, M, S, sheet, onclick) {

  // The view
  const board = new CanvasTiles(N, M, S, S, sheet, onclick);

  board.restart = function() {
    // Checkerboard pattern
    board.forEachTile(function(i,j) {
      // odd row & odd col  or  even row & even col
      const ee = (i % 2 === 0) && (j % 2 === 0); // even/even
      const oo = (i % 2 === 1) && (j % 2 === 1); // odd/odd
      const tilename = (ee || oo)? 'CHECKER-DARK' : 'CHECKER-LIGHT';
      board.tile(i, j).draw('checker', tilename);
    });
    board.enable();
  }

  function mapToTilename(value, owner) {
    return (value === 'F')? (owner || '*') : value;
  }

  board.setvalue = function(i, j, value, owner) {

    board.tile(i,j).hidden = false;
    board.tile(i,j).value = value;

    // Assume valid value
    const tilename = mapToTilename(value, owner);
    board.tile(i,j).draw('value', tilename);
  };

  const lastselect = {i: 0, j: 0};

  board.select = function(i, j) {
    board.tile(lastselect.i, lastselect.j).erase('outline');
    board.tile(i, j).draw('outline', 'OUTLINE');
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

  board.forEachTile(function(i,j) {
    //  Top/Centre/Bottom - Left/Centre/Right
    //
    //    T      TL TC TR
    //  L C R    CL CC CR
    //    B      BL BC BR

    board.tile(i,j).adjacent = function() {
      const TL = board.tile(i - 1, j - 1);
      const TC = board.tile(i - 1, j - 0);
      const TR = board.tile(i - 1, j + 1);
      const CL = board.tile(i - 0, j - 1);
      const CR = board.tile(i - 0, j + 1);
      const BL = board.tile(i + 1, j - 1);
      const BC = board.tile(i + 1, j - 0);
      const BR = board.tile(i + 1, j + 1);

      return [TL, TC, TR, CL, CR, BL, BC, BR];
    };
  });

  // Load the tilesheet...
  sheet.img.onload = function() {
    // Start with a fresh board
    board.restart();
  }
  sheet.img.src = 'tile-sheet.png'

  return board;
}

export {FlagsBoard, TILESHEET};