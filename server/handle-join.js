const auth = require('./auth.js');
module.exports =
function handle_join(match) {
    return function(socket, message) {
        if (match.playerA === null) {
            match.playerA = socket;

            const claim = JSON.stringify({
                match_id   : match.id,
                playing_as : 0
            });

            socket.send({
                type       : 'join',
                status     : 'OPEN',
                id         : match.id,
                playing_as : 0,
                hmac       : auth.hmac(claim)
            });
            return null;
        }
    
        if (match.playerB === null) {
            match.playerB = socket;

            const claim = JSON.stringify({
                match_id   : match.id,
                playing_as : 1
            });

            socket.send({
                type       : 'join',
                status     : 'OPEN',
                id         : match.id,
                playing_as : 1,
                hmac       : auth.hmac(claim)
            });  
            match.playerA.send({ type: 'start' });
            match.playerB.send({ type: 'start' });
            return null;
        }
    
        socket.send({ type: 'join', status: 'BUSY' });
        return null;
    }
};