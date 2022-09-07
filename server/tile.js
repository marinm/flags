module.exports =
function Tile(board, i, j) {

    // The default tile has value 0 and is not revealed
    // This is convenient for setting up a new board
    const state = {
        value    : 0,
        revealed : false,
    }

    return {
        value:
        function() {
            return state.value;
        },

        increment:
        function() {
            // Do nothing for a flag tile
            if (this.isFlag()) return null;

            // The number must be in the range [0...8]
            state.value = Math.min(state.value + 1, 8);
            return null;
        },

        isFlag:
        function(set) {
            if (set === true) state.value = 'F';
            return state.value === 'F';
        },

        isNumber:
        function() {
            return state.value != 'F';
        },

        reveal:
        function() {
            state.revealed = true;
            return { i, j, value: state.value };
        },

        isRevealed:
        function() {
            return state.revealed;
        },

        neighbours:
        function() {
            //  TL TC TR
            //  CL    CR
            //  BL BC BR

            return [
                board.at(i - 1, j - 1), // TL
                board.at(i - 1, j - 0), // TC
                board.at(i - 1, j + 1), // TR
                board.at(i - 0, j - 1), // CL
                board.at(i - 0, j + 1), // CR
                board.at(i + 1, j - 1), // BL
                board.at(i + 1, j - 0), // BC
                board.at(i + 1, j + 1), // BR
            ].filter(tile => tile != undefined);
        },
    }
}