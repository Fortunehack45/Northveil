console.log('Testing Multi-Source Live Token Pricing...');

async function testPricing() {
  const livePrices = {};

  // 1. Binance Public 24hr Ticker
  try {
    const res = await fetch('https://api.binance.com/api/v3/ticker/24hr');
    if (res.ok) {
      const data = await res.json();
      const usdtPairs = data.filter(d => d.symbol.endsWith('USDT'));
      usdtPairs.forEach(p => {
        const sym = p.symbol.replace('USDT', '');
        livePrices[sym] = {
          usd: parseFloat(p.lastPrice),
          change24h: parseFloat(p.priceChangePercent),
          source: 'binance'
        };
      });
      console.log(`✓ Binance: Fetched ${usdtPairs.length} live USDT pairs (BTC: $${livePrices['BTC']?.usd}, ETH: $${livePrices['ETH']?.usd}, SOL: $${livePrices['SOL']?.usd})`);
    }
  } catch (e) {
    console.warn('Binance error:', e.message);
  }

  // 2. DexScreener for multi-chain and DEX tokens (e.g. AERO, VIRTUAL, DEGEN, BRETT, PEPE)
  try {
    const tokenAddresses = [
      '0x940181a94a35a4569e4529a3cdfb74e38fd98631', // AERO on Base
      '0x4ed4e862860bed51a9570b96d89af5e1b0efefed', // DEGEN on Base
      '0x532f27101965dd16442e59d40670faf5ebb142e4', // BRETT on Base
      '0x0b3e328455c4059eeb9e3f84b5543f74e24e7e1b', // VIRTUAL on Base
    ].join(',');
    const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${tokenAddresses}`);
    if (res.ok) {
      const data = await res.json();
      data.pairs?.forEach(p => {
        const sym = p.baseToken?.symbol?.toUpperCase();
        if (sym && !livePrices[sym]) {
          livePrices[sym] = {
            usd: parseFloat(p.priceUsd),
            change24h: parseFloat(p.priceChange?.h24 || 0),
            source: 'dexscreener'
          };
        }
      });
      console.log(`✓ DexScreener: Fetched DEX token prices (AERO: $${livePrices['AERO']?.usd}, DEGEN: $${livePrices['DEGEN']?.usd}, BRETT: $${livePrices['BRETT']?.usd})`);
    }
  } catch (e) {
    console.warn('DexScreener error:', e.message);
  }

  // 3. DefiLlama Coins API
  try {
    const llamaCoins = 'coingecko:ethereum,coingecko:bitcoin,coingecko:solana,coingecko:binancecoin,coingecko:arbitrum,coingecko:optimism,coingecko:matic-network,coingecko:avalanche-2,coingecko:base';
    const res = await fetch(`https://coins.llama.fi/prices/current/${llamaCoins}`);
    if (res.ok) {
      const data = await res.json();
      console.log('✓ DefiLlama Coins API returned:', Object.keys(data.coins || {}).length, 'coins');
    }
  } catch (e) {
    console.warn('DefiLlama error:', e.message);
  }

  console.log(`Total live token price records: ${Object.keys(livePrices).length}`);
}

testPricing().catch(console.error);
