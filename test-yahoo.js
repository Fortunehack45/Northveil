async function test() {
  try {
    const res = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/ETH-USD?interval=1wk&range=max');
    const data = await res.json();
    console.log(data.chart?.result?.[0]?.timestamp?.length);
    console.log(new Date(data.chart?.result?.[0]?.timestamp[0] * 1000).toISOString());
  } catch (e) {
    console.error(e);
  }
}
test();
