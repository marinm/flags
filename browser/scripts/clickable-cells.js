// Add an on-click event listener to any DOM node.
// The click coordinates are converted to (i,j) coordinates.
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

export default function clickableCells({ element, w, h, onclick, context }) {
	// No sanity checks on arguments
	// Caller responsible for providing arguments that work

	// Simple switch for the click handler
	let on = true;

	element.addEventListener("click", function (event) {
		if (!on) return;

		const i = Math.floor(event.offsetY / h);
		const j = Math.floor(event.offsetX / w);
		onclick(i, j, context);
	});

	return {
		on: () => (on = true),
		off: () => (on = false),
	};
}
