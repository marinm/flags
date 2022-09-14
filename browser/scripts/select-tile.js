export default
function selectTile(i, j, socket) {
    socket.send({type: 'select', i, j});
};