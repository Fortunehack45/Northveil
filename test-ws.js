import WebSocket from 'ws';

const ws = new WebSocket('wss://stream.binance.us:9443/ws/ethusdt@ticker');

ws.on('open', function open() {
  console.log('connected');
});

ws.on('message', function incoming(data) {
  console.log('Received:', data.toString());
  ws.close();
});

ws.on('error', function error(err) {
  console.error('Error:', err);
});
