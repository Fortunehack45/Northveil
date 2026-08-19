# Volume 4: Smart Contract Compiler & AST Auditor

## 1. In-Memory Compilation Engine

Northveil embeds the official Solidity compiler (`solc`) within its runtime, enabling instant compilation of:
- **ERC-20 Fungible Tokens** (with burnable, mintable, and capped supply features)
- **ERC-721 NFT Collections** (with enumerable, URI storage, and royalty support)
- **Time-Locked Vesting & Escrow Contracts**
- **Custom User Solidity Source Code**

## 2. Deterministic Address Computation

To eliminate long blocking times during contract deployments, Northveil broadcasts the raw signed transaction to the mempool and computes the contract address using deterministic RLP hashing:

```typescript
import { ethers } from 'ethers';

export function calculateContractAddress(deployerAddress: string, nonce: number): string {
  return ethers.getCreateAddress({
    from: deployerAddress,
    nonce: nonce,
  });
}
```

## 3. Static AST Security Ruleset

Before contract deployment, the source code undergoes automated static security inspection:

| Vulnerability Check | Risk Level | Description |
| :--- | :--- | :--- |
| **Reentrancy Attack** | 🔴 CRITICAL | State variable modified after external call (`call.value`). |
| **`tx.origin` Authentication** | 🔴 CRITICAL | Use of `tx.origin` instead of `msg.sender` enables phishing exploits. |
| **Unbounded Loop in Constructor** | 🟡 HIGH | Large loops in constructor lead to transaction out-of-gas reverts. |
| **Unchecked Low-Level Call** | 🟡 HIGH | Low-level `call` without checking the boolean return value. |
| **Missing Access Control** | 🟡 HIGH | Public `mint()` or `withdraw()` without `onlyOwner` modifier. |
