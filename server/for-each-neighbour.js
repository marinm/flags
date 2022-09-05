module.exports =
function forEachNeighbour(i, j, action, context) {
    action(i - 1, j - 1, context); // TL
    action(i - 1, j - 0, context); // TC
    action(i - 1, j + 1, context); // TR
    action(i - 0, j - 1, context); // CL
    action(i - 0, j + 1, context); // CR
    action(i + 1, j - 1, context); // BL
    action(i + 1, j - 0, context); // BC
    action(i + 1, j + 1, context); // BR
};