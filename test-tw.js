async function test() {
  const chains = ['ethereum', 'bitcoin', 'solana', 'binance', 'smartchain', 'arbitrum', 'polygon', 'avalanche'];
  for (const c of chains) {
    const res = await fetch(`https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${c}/info/logo.png`);
    console.log(`${c}: ${res.status}`);
  }
}
test();
