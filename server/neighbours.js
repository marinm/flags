module.exports =
function neighbours(i, j) {
    //  TL TC TR
    //  CL    CR
    //  BL BC BR

    return [
        [i - 1, j - 1], // TL
        [i - 1, j - 0], // TC
        [i - 1, j + 1], // TR
        [i - 0, j - 1], // CL
        [i - 0, j + 1], // CR
        [i + 1, j - 1], // BL
        [i + 1, j - 0], // BC
        [i + 1, j + 1], // BR
    ];
};