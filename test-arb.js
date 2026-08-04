async function test() {
  const url = 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/info/logo.png';
  const res = await fetch(url);
  console.log(`Status: ${res.status}`);
}
test();
