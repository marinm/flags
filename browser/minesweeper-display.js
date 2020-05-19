const TMP_N = 24;
const TMP_M = 24;
const TMP_CELLSIZE = 24;

var tileboard = new CanvasTiles({
  id: 'board',
  N: TMP_N,
  M: TMP_M,
  cellsize: TMP_CELLSIZE,
  onclick: report_click
});

function report_click(i, j) {
  console.log(i, j);
  tileboard.fill(i, j, 'aliceblue');
}