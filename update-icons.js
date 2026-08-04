import fs from 'fs';

const path = 'c:/Users/USER PC/Desktop/Northveil/src/data/initialData.ts';
let content = fs.readFileSync(path, 'utf8');

const replacements = {
  'https://assets.coingecko.com/coins/images/279/small/ethereum.png': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png',
  'https://assets.coingecko.com/coins/images/4128/small/solana.png': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png',
  'https://assets.coingecko.com/coins/images/1/small/bitcoin.png': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/bitcoin/info/logo.png',
  'https://assets.coingecko.com/coins/images/16547/small/arbitrum.png': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/info/logo.png',
  'https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/info/logo.png',
  'https://assets.coingecko.com/coins/images/4713/small/polygon.png': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/info/logo.png',
  'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/info/logo.png',
  'https://assets.coingecko.com/coins/images/12559/small/coin-round-red.png': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/avalanchec/info/logo.png',
  'https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/avalanchec/info/logo.png',
  'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png'
};

for (const [oldUrl, newUrl] of Object.entries(replacements)) {
  content = content.split(oldUrl).join(newUrl);
}

fs.writeFileSync(path, content);
console.log('Icons updated successfully!');
