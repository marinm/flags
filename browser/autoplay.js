
import selectRandomTile from './select-random-tile.js';
import selectTile from './select-tile.js';

// tile
//   i
//   j
//   hidden
//   value
//   owner
//   is_inferred_flag
//   is_inferred_number


function is_nonzero_number(tile) {
    return tile && !tile.hidden && [1,2,3,4,5,6,7,8].includes(tile.value);
}

function is_number(tile) {
    const value_is_number = [0,1,2,3,4,5,6,7,8].includes(tile.value);
    return tile && (tile.is_inferred_number || value_is_number);
}

function is_flag(tile) {
    const value_is_flag = (!tile.hidden && !is_number(tile));
    return tile && (tile.is_inferred_flag || value_is_flag);
}

function is_unknown(tile) {
    return tile && tile.hidden && !tile.is_inferred_number && !tile.is_inferred_flag;
}

function mark_as_flag(i, j, board, canvas) {
    const gameTile = board.at(i, j);
    const canvasCell = canvas.at(i, j);

    gameTile.is_inferred_flag = true;
    canvasCell.draw('guide', 'FLAGHERE');
}

function mark_as_number(i, j, board, canvas) {
    const gameTile = board.at(i, j);
    const canvasCell = canvas.at(i, j);

    gameTile.is_inferred_number = true;
    canvasCell.draw('guide', 'NOFLAG');
}


function infer_neighbours(i, j, board, canvas) {

    const tile = board.at(i, j);
    let num_inferred = 0;

    // Can only infer neighbours of non-zero number tiles
    if (!is_nonzero_number(tile)) return;

    const neighbours               = board.adjacent(i, j);
    const unknown                  = neighbours.filter(is_unknown);
    const flags                    = neighbours.filter(is_flag);
    const numbers                  = neighbours.filter(is_number);

    const num_unknown              = unknown.length;
    const num_flags                = flags.length;
    const num_numbers              = numbers.length;
    const num_unknown_flags        = tile.value - num_flags;
    const num_unknown_numbers      = num_unknown - num_unknown_flags;

    const all_unknowns_are_flags   = (num_unknown === num_unknown_flags);
    const all_unknowns_are_numbers = (num_unknown === num_unknown_numbers);

    if (all_unknowns_are_flags) {
        unknown.forEach( nb => mark_as_flag(nb.i, nb.j, board, canvas) );
        num_inferred = unknown.length;
    }

    if (all_unknowns_are_numbers) {
        unknown.forEach( nb => mark_as_number(nb.i, nb.j, board, canvas) );
        num_inferred = unknown.length;
    }

    return num_inferred;
}

// Find where there must be a flag
function scan(gamestate, gameboardCanvas) {
    // Number of hidden flags found 
    let num_inferred = 0;

    // Get non-zero number tiles
    const number_tiles = gamestate.board.filter(is_nonzero_number);

    number_tiles.forEach(function(tile) {
        num_inferred += infer_neighbours(tile.i, tile.j, gamestate.board, gameboardCanvas);
    });

    console.log('num_inferred ' + num_inferred);

    return num_inferred;
}

// Scan through the board and reason about where flags must and must not be
function solverscan(gamestate, gameboardCanvas) {
    let num_inferred = 0;
    let scan_counter = 0;
    const MAX_SCANS = 10;
  
    do {
        num_inferred = scan(gamestate, gameboardCanvas);
        scan_counter++;
    } while (scan_counter <= MAX_SCANS && num_inferred > 0);

    console.log(scan_counter);
    
    return null;
}

function select_next_unrevealed_flag(gamestate, socket) {

    const hidden_tiles = gamestate.board.filter(tile => tile.is_inferred_flag);

    // Select the first tile marked as a known flag
    if (hidden_tiles.length > 0) {
        const first_find = hidden_tiles[0];
        selectTile(first_find.i, first_find.j, gamestate, socket);

        // Unset the flag flag so it won't get picked again
        first_find.is_inferred_flag = false;
    }
    else {
        selectRandomTile(gamestate, socket);
    }
}

export default {
    solverscan,
    select_next_unrevealed_flag,
};