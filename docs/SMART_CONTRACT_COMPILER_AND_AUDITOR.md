# Northveil Smart Contract Studio & AST Security Auditor Manual

## 1. Solidity Compilation Subsystem
- **Compiler**: Solc `^0.8.20`
- **Output Artefacts**: Bytecode, ABI, AST, Method Identifiers, Gas Estimates.
- **Contract Templates**:
  - `ERC20Standard`: Token with custom supply, symbol, decimals, and optional burnable/mintable extensions.
  - `ERC721NFT`: Collection with metadata URI, royalties, and enumerable tokens.
  - `StakingRewards`: Time-locked reward distribution pool.

## 2. AST Static Analysis Rules Engine

| Vulnerability Code | Severity | Rule Description | AST Detection Logic |
|---|---|---|---|
| `NV-SEC-001` | HIGH | Reentrancy Vector | External call before state variable assignment. |
| `NV-SEC-002` | HIGH | Unchecked Low-Level Call | `.call{value:...}("")` lacking boolean return check. |
| `NV-SEC-003` | CRITICAL | Unprotected Minting | Public/external `mint()` without `onlyOwner`. |
| `NV-SEC-004` | MEDIUM | Tx.Origin Authentication | `tx.origin == ...` used for access control. |
| `NV-SEC-005` | CRITICAL | Honeypot Transfer Trap | Blacklist checks or confiscation inside `_transfer()`. |

## 3. Scoring & Risk Classification
$$	ext{Security Score} = 100 - \sum (	ext{Critical} 	imes 25 + 	ext{High} 	imes 15 + 	ext{Medium} 	imes 8 + 	ext{Low} 	imes 3)$$
- **Score $\ge 85$**: `LOW RISK` (Production Ready)
- **Score $65 - 84$**: `MEDIUM RISK` (Review Recommended)
- **Score $< 65$**: `HIGH RISK` (Exploits Detected)
