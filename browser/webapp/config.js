export const config = {
    board: {
        numRows    : 5,
        numColumns : 5,
        numFlags   : 10,
    },
    canvas: {
        tileWidth  : 60,
        tileHeight : 60,
    },
    tilesheet: {
        filepath   : '../art/tile-sheet.png',
        tileWidth  : 60,
        tileHeight : 60,

        tiles: {
            'BACKGROUND'    :  [2,0],
            'F'             :  [1,0],
            '0'             :  [0,0],
            '1'             :  [0,1],
            '2'             :  [0,2],
            '3'             :  [0,3],
            '4'             :  [0,4],
            '5'             :  [0,5],
            '6'             :  [0,6],
            '7'             :  [0,7],
            '8'             :  [0,8],
        }
    }
};