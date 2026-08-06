import { ethers } from 'ethers';

const sepoliaProvider = new ethers.JsonRpcProvider('https://ethereum-sepolia-rpc.publicnode.com');

async function check() {
  const addr1 = '0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417';
  const addr2 = '0x87678de86804c6c3612d66cbd6e2857f1a7d8345';
  
  const bal1 = await sepoliaProvider.getBalance(addr1);
  const bal2 = await sepoliaProvider.getBalance(addr2);

  console.log(`Address ${addr1} SepoliaETH Balance: ${ethers.formatEther(bal1)} ETH`);
  console.log(`Address ${addr2} SepoliaETH Balance: ${ethers.formatEther(bal2)} ETH`);
}

check();
