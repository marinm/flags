import Matrix from './matrix.js';

export default
function Board(n, m) {

    const matrix = Matrix(n, m);

    matrix.fill(function(i, j) {
        return {
            i      : i,
            j      : j,
            hidden : true,
            value  : null,
            owner  : null,
        };
    });

    function adjacent(i,j) {
        return [
            matrix.at(i - 1, j - 1),
            matrix.at(i - 1, j - 0),
            matrix.at(i - 1, j + 1),
            matrix.at(i - 0, j - 1),
            matrix.at(i - 0, j + 1),
            matrix.at(i + 1, j - 1),
            matrix.at(i + 1, j - 0),
            matrix.at(i + 1, j + 1),
        ].filter(cell => cell != undefined);
    }

    return {...matrix, adjacent};
}