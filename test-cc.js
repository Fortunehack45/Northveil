async function test() {
  try {
    const res = await fetch('https://min-api.cryptocompare.com/data/v2/histoday?fsym=ETH&tsym=USD&allData=true');
    const data = await res.json();
    console.log(JSON.stringify(data).slice(0, 500));
  } catch (e) {
    console.error(e);
  }
}
test();
