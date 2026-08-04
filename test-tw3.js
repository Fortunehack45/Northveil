async function test() {
  const chains = ['avalanchec/info/logo.png'];
  for (const c of chains) {
    const res = await fetch(`https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${c}`);
    console.log(`${c}: ${res.status}`);
  }
}
test();
