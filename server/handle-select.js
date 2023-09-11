module.exports =
function handle_select(match) {
    return function(playerSocket, message) {

        const isPlayerA = playerSocket.playerId === match.playerSocketA.playerId;
        const isPlayerB = playerSocket.playerId === match.playerSocketB.playerId;

        // Ignore requests from non-players
        if (!isPlayerA && !isPlayerB) return null;

        const gamestate = match.match.state();

        const A_selects = (isPlayerA && gamestate.turn === 0);
        const B_selects = (isPlayerB && gamestate.turn === 1);

        // Player selects out of turn
        // Do nothing
        // Client should avoid this situation
        if (!A_selects && !B_selects) return null;

        const response = {
            type : 'reveal',
            for  : {i: message.i, j: message.j},
            ...match.match.select(message.i, message.j)
        };
        match.playerSocketA.send(response);
        match.playerSocketB.send(response);
        
        return null;
    }
};