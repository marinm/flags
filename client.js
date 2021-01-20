const WebSocket = require('ws');

const ws = new WebSocket('wss://localhost:9010');

ws.on('open', function open() {
  ws.send('something');
});

ws.on('message', function incoming(data) {
  console.log(data);
});
