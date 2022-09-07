module.exports =
function Tile() {

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
            if (this.isFlag()) return;

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
            return null;
        },

        isRevealed:
        function() {
            return state.revealed;
        },
    }
}