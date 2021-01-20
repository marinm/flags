// WebSockets Server

require('dotenv').config();

const fs = require('fs');
const https = require('https');
const WebSocket = require('ws');
const storage = require('./storage.js');
const FlagsGame = require('./game.js');


const BOARD_N = 24;
const BOARD_M = 24;
const BOARD_R = 96;

var room = {
  player_0: null,
  player_1: null,
  game: null,
  lock: false,
};

const SERVER_PORT = process.env.WSS_PORT
const LOGIN_TIMEOUT_MS = 3000;
const PING_INTERVAL = 20000;


const server = https.createServer({
  cert: fs.readFileSync(process.env.SSL_CERT),
  key: fs.readFileSync(process.env.SSL_KEY)
});

const wss = new WebSocket.Server({ server });


// Keep track of which player ID's are already logged in
const logged_in_list = new Set();


function msend(ws, message) {
  ws.send(JSON.stringify(message));
}

wss.on('connection', function(ws) {
  //
  // When a new connection starts
  //

  // Each WebSocket connection is binded to a player and maybe a game
  const session = {
    ws:            ws,
    heartbeat:     null,
    alive:         false,
    login_timeout: null,
    player:        null,
    playing_as:    null
  };

  // Start a login timeout, after which the server closes the connection
  session.login_timeout = setTimeout(function() {
    end_session(session);
  }, LOGIN_TIMEOUT_MS);

  session.alive = true;
  session.heartbeat = setInterval(function() {
    if (!session.alive) {
      end_session(session);
    }
    else {
      // Send peer a ping
      session.ws.ping();
      session.alive = false;
    }
  }, PING_INTERVAL);

  ws.on('pong', function() {
    // Received pong from peer
    session.alive = true;
  });

  // Received message from client
	ws.on('message', function(msg) {

    // Try to parse the message
    const req = parse(msg);

    if (req && (session.logged_in || req.type === 'LOGIN')) {

      console.log("Message: type " + req.type);

      // Pass valid request to the handlers
      handlers[req.type](session, req);
    }
    else {
      // Reject bad request
      // A non-logged in user is making a non-login request
      // End the session
      end_session(session);
    }
  });

  ws.on('close', function() {
    // Client connection closed
    // If the socket was closed by the server, then it was by end_session().
    // The code here is done when either the client or the server closed the socket.
    session_ends(session);
  });
});


wss.on('close', function() {
  // The WebSocket server closes
  // Do nothing...
});


function parse(req) {
  // Parse a JSON message and check that it is valid
  try {
    const parsed = JSON.parse(req);
    if (parsed.type != undefined && Object.keys(handlers).includes(parsed.type)) {
      // It's now up to each handler to check the request object structure
      return parsed;
    }
    else {
      // Ignore bad requests and unknown request types
      return null;
    }
  }
  catch (err) {
    return null;
  }
}


function authenticate(key, valid, invalid) {

  // Sanitize the key
  const passes = /^[A-Z0-9]{16}$/.test(String(key));

  if (passes) {
    storage.get_player_by_key(key,
      function(result) {
        if (result)
          valid(result);
        else 
          invalid();
      }
    );
  }
  else {
    // Bad input
    invalid();
  }
}



const handlers = {
  'HEARTBEAT':
  function(session, req) {
  },

  'LOGIN':
  function(session, req) {

    // Make sure the request is valid
    if (req.p_key === undefined) {
      console.log("Bad request format");
      end_session(session);
      return;
    }

    if (session.player) {
      // This session already did a successful login
      // Reject multiple login attempt
      // Close the connection
      end_session(session);
      return;
    }

    //
    // The client is not yet logged in
    //

    // Authenticate
    // Race condition with login timeout?
    authenticate(
      req.p_key,
      function(player) {
        // The key is valid
        if (logged_in_list.has(player.p_id)) {
          // This player is already logged in from another WebSocket session
          // Reject multiple login attempt
          // Close the connection
          console.log("Player trying to login from multiple locations");
          end_session(session);
        }
        else {
          // Player is now logged in
          session.player = player;

          console.log("Player logged in: " + JSON.stringify(player));

          clearTimeout(session.login_timeout);
          logged_in_list.add(session.player.p_id);

          // Reply with login info
          msend(session.ws, {type: "LOGIN-OK", p_id: session.player.p_id, p_name: session.player.p_name});

          // Check if this player can join the game
          join(session);
        }
      },
      function() {
        // Invalid key
        // Reject login attempt
        // Close the connection
        end_session(session);
      }
    );
  },

  //
  // All other handlers below assume a player is already logged in
  // ie. session.player != null
  //

  'SELECT':
  function(session, req) {

    // Make sure the request is valid
    if (req.i === undefined || req.j === undefined) {
      console.log("Bad request format");
      end_session(session);
      return;
    }

    if (!session.playing_as) {
      // This player is not yet playing a game
      // Close the connection
      end_session(session);
      return;
    }

    const gamestate = game.getstate();

    // Check if this is the player's turn
    const player_0_selects = (session.playing_as === 0 && gamestate.turn === 0);
    const player_1_selects = (session.playing_as === 1 && gamestate.turn === 1);

    if (player_0_selects || player_1_selects) {
      // Player selects on their turn
      var response = game.select(req.i, req.j);
      response.type = 'REVEAL';
      response.for = {i: req.i, j: req.j};
      msend(room.player_0.ws, response);
      msend(room.player_0.ws, response);
    }
    else {
      // Player selects out of turn
      // Client should avoid this situation
      // Close the connection
      end_session(session);
    }
  },
};


function join(session) {

  // Check if a player can join the game

  // The game lock is only a shortcut condition variable; there are no race conditions.
  // Calls to join(session) are queued by the JavaScript runtime and are guaranteed to run-to-completion.
  if (room.lock) {
    // Tell the client that the game is busy
    msend(session.ws, { type: 'JOIN', status: 'BUSY' });
    return;
  }

  if (!room.player_0) {
    // This session is now playing as player_0
    room.player_0 = session;
    session.playing_as = 0;
    msend(room.player_0.ws, { type: 'JOIN', status: 'OPEN', playing_as: 0 });
    return;
  }

  if (!room.player_1) {

    // This session is now playing as player_1
    room.player_1 = session;
    session.playing_as = 1;
    msend(room.player_1.ws, { type: 'JOIN', status: 'OPEN', playing_as: 1 });

    // Start a new game
    room.game = FlagsGame(BOARD_N, BOARD_M, BOARD_R);

    // Tell both players that the game has started, and some info about their opponent
    const players = [room.player_0.player.p_name, room.player_1.player.p_name];
    msend(room.player_0.ws, { type: 'START', players: players });
    msend(room.player_1.ws, { type: 'START', players: players });

    room.lock = true;

    return;
  }

  // If control reaches this point, there was an error...
}


function session_ends(session) {

  // What to do when (after) a socket is closed, either by the client or server

  clearInterval(session.heartbeat);

  if (session.player) {
    console.log("Session closed for " + session.player.p_id);
    logged_in_list.delete(session.player.p_id);

    if (session.playing_as != null) {

      // The player left mid-game
      // End the game

      //
      // game.revealall()?
      //

      // Let the opponent know
      if (session.playing_as === 0 && room.player_1 != null)
        msend(room.player_1.ws, { type: 'opponent-disconnected' });
      if (session.playing_as === 1 && room.player_0 != null)
        msend(room.player_0.ws, { type: 'opponent-disconnected' });

      session.playing_as = null;

      // Kick out both players
      room.player_0 = null;
      room.player_1 = null;
      room.game = null;
      room.lock = false;
    }
    else {
      // Was logged in but not playing
    }
  }
  else {
    console.log("Session closed for stranger");
    // Session was not binded to a player or the player was not involved in a game
  }

  //
  // Not sure if this is necessary...
  // Only WebSocket event listeners should be using the session object
  // Once the session is closed, could a queued function use the session again?
  //
  session.ws = null;
}

function end_session(session) {
  // When the server wants to close the session/socket
  session.ws.close();
}



//
// Start the server
//

server.listen(SERVER_PORT);
console.log('Secure WebSocket Server started on port ' + SERVER_PORT);