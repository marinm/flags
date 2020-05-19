// Turn a <canvas> into a tiled N-by-M gameboard.
//
//        0    1    2    3    4
//      +----+----+----+----+----+
//   0  |    |    |    |    |    |
//      +----+----+----+----+----+
//   1  |    |    |    |    |    |
//      +----+----+----+----+----+
//   2  |    |    |    |    |    |
//      +----+----+----+----+----+
//   3  |    |    |    |    |    |
//      +----+----+----+----+----+
//   4  |    |    |    |    |    |
//      +----+----+----+----+----+
//
// Tiles can be coloured in individually.
// Clicking anywhere inside tile (i,j) triggers a custom callback(i,j).
//
// The board object also maintains an N-by-M array of user-defined values.


// Assumes options and function arguments make sense.
// No safety checks.
function CanvasTiles(options) {

  const settings = $.extend({
    id: 'board',
    N: 4,
    M: 4,
    cellsize: 20,
    gapcol: '#ccc',
    bgcol: '#fff',
    onclick: noop
  }, options);

  function noop(i,j) {
  }

  const stats = {
    height: settings.N * settings.cellsize + 1,
    width: settings.M * settings.cellsize + 1,
    values: []
  };

  const board = document.getElementById(settings.id);

  board.setAttribute('width', stats.width);
  board.setAttribute('height', stats.height);

  const ctx = board.getContext('2d');

  function drawgrid() {
    ctx.fillStyle = settings.gapcol;

    // Draw horizontal lines
    for (var i = 0; i < settings.N; i++) {
      var x = i * settings.cellsize;
      ctx.fillRect(x, 0, 1, stats.height);
    }
  
    // Draw vertical lines
    for (var j = 0; j < settings.M; j++) {
      var y = j * settings.cellsize;
      ctx.fillRect(0, y, stats.width, 1);
    }
  
    // Bottom edge
    ctx.fillRect(0, stats.height - 1, stats.width, 1);
  
    // Right edge
    ctx.fillRect(stats.width - 1, 0, 1, stats.height);
  }

  drawgrid();

  for (var i = 0; i < settings.N; i++) {
    stats.values[i] = [];
    for (var j = 0; j < settings.M; j++) {
      stats.values[i][j] = 0;
    }
  }

  board.addEventListener('click', function(event) {
      const i = Math.floor(event.offsetX / settings.cellsize);
      const j = Math.floor(event.offsetY / settings.cellsize);
      settings.onclick(i, j);
  });

  return {
    fill:
    function(i, j, colour) {
      var fill_x = i * settings.cellsize + 1;
      var fill_y = j * settings.cellsize + 1;
    
      ctx.fillStyle = colour;
      ctx.fillRect(fill_x, fill_y, settings.cellsize - 1, settings.cellsize - 1);
    },
    set:
    function(i, j, val) {
      stats.values[i][j] = val;
    },
    get:
    function(i, j) {
      return (i && j)? stats.values[i][j] : stats.values;
    }
  }
}