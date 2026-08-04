async function test() {
  const chains = ['avalanchec', 'ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'];
  for (const c of chains) {
    const res = await fetch(`https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${c}/logo.png`);
    console.log(`${c}: ${res.status}`);
  }
}
test();
