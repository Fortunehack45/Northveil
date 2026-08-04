async function test() {
  try {
    const res = await fetch('https://api.coincap.io/v2/assets/ethereum/history?interval=d1');
    const data = await res.json();
    console.log(data.data?.length);
    console.log(new Date(data.data?.[0]?.time).toISOString());
  } catch (e) {
    console.error(e);
  }
}
test();
