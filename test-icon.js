async function test() {
  const symbols = ['eth', 'btc', 'sol', 'bnb', 'arb', 'matic', 'avax', 'usdc'];
  for (const sym of symbols) {
    const res = await fetch(`https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1/svg/color/${sym}.svg`);
    console.log(`${sym}: ${res.status}`);
  }
}
test();
