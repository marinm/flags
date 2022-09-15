module.exports =
function handle_version() {
    return function(socket, message) {
        // Need a server version scheme...
        socket.send({type: 'version', version: null});
        return null;
    };
};