async function test() {
  const res = await fetch('https://api.binance.com/api/v3/klines?symbol=ETHUSDT&interval=1w&limit=1000');
  const data = await res.json();
  console.log('Length:', data.length);
  // Kline format: [
  //   1499040000000,      // Open time
  //   "0.01633102",       // Open
  //   "0.80000000",       // High
  //   "0.01575800",       // Low
  //   "0.01577100",       // Close
  //   "148976.11427815",  // Volume
  //   1499644799999,      // Close time
  // ...
  if (data.length > 0) {
    console.log('First point:', data[0]);
    console.log('Last point:', data[data.length - 1]);
  }
}

test();
