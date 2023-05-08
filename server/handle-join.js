module.exports =
function handle_join(match) {
    return function(socket, message) {
        if (match.playerA === null) {
            match.playerA = socket;
            socket.send({
                type       : 'join',
                status     : 'OPEN',
                id         : match.id,
                playing_as : 0
            });
            return null;
        }
    
        if (match.playerB === null) {
            match.playerB = socket;
            socket.send({
                type       : 'join',
                status     : 'OPEN',
                id         : match.id,
                playing_as : 1
            });  
            match.playerA.send({ type: 'start' });
            match.playerB.send({ type: 'start' });
            return null;
        }
    
        socket.send({ type: 'join', status: 'BUSY' });
        return null;
    }
};