module.exports =
function handle_select(match) {
    return function(socket, message) {

        // Ignore requests from non-players
        if (socket != match.playerA && socket != match.playerB) return null;

        const gamestate = match.match.state();

        const A_selects = (socket.id === match.playerA.id && gamestate.turn === 0);
        const B_selects = (socket.id === match.playerB.id && gamestate.turn === 1);

        if (A_selects || B_selects) {
            const response = {
                type : 'reveal',
                for  : {i: message.i, j: message.j},
                ...match.match.select(message.i, message.j)
            };
            match.playerA.send(response);
            match.playerB.send(response);
            return null;
        }

        // Player selects out of turn
        // Do nothing
        // Client should avoid this situation
        return null;
    }
};