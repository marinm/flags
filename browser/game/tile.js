export
function Tile() {

    const FLAG = 'F';

	const state = {
		value   : 0,
		hidden  : true,
	};

    function numberIsValid(number) {
        return (number >= 0) && (number <= 8);
    }

	return {
        state:
        function() {
            return state;
        },

		value:
        function() {
			return state.value;
		},

		setNumber:
        function(number) {
            if ( numberIsValid(value) )
                state.number = number;
		},

		setFlag:
        function() {
			state.value = FLAG;
		},

        isZero:
        function() {
            return state.value === 0;
        },

		isFlag:
        function() {
			return state.value === FLAG;
		},

		isNumber:
        function() {
			return !this.isFlag();
		},

		isHidden:
        function() {
			return state.hidden;
		},

		increment:
        function() {
			if (this.isNumber()) {
				state.value++;
			}
			return this;
		},

		reveal:
        function() {
			state.hidden = false;
			return this.state();
		},
	};
};
