async function test() {
  const res = await fetch('https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=max');
  const data = await res.json();
  console.log(JSON.stringify(data).slice(0, 500));
}

test();
