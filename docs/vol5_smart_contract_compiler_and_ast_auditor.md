# Northveil Technical Encyclopedia — Volume V: Smart Contract Compiler & AST Auditor

## 1. Compiler Subsystem Architecture
- **Compiler Version**: Solc `v0.8.20+commit.a1b79de6`
- **Optimization**: Enabled with 200 runs.
- **EVM Target**: `paris` / `cancun`

## 2. AST Vulnerability Scanner Rules Catalog

| Rule ID | Name | Severity | Detection Vector |
|---|---|---|---|
| `NV-SEC-001` | Reentrancy Attack | HIGH | External state call executed before internal balance zeroing. |
| `NV-SEC-002` | Unchecked Low-Level Call | HIGH | `.call{value: ...}("")` lacking boolean return check. |
| `NV-SEC-003` | Arbitrary Minting | CRITICAL | Public `mint()` function lacking `onlyOwner` modifier. |
| `NV-SEC-004` | Tx.Origin Authentication | MEDIUM | `tx.origin` used instead of `msg.sender`. |
| `NV-SEC-005` | Honeypot Transfer Trap | CRITICAL | Hidden balance deduction or blacklist trap in `transfer()`. |
