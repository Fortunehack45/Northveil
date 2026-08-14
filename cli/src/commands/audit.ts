import * as fs from 'fs';
import * as path from 'path';
import { postApi } from '../utils';

export function registerAuditCommand(program: any) {
  program
    .command('audit [fileOrAddress]')
    .description('Run static vulnerability, backdoor, and reentrancy analysis on Solidity code or contract')
    .action(async (fileOrAddress = './MyContract.sol') => {
      let codeToAudit = '';
      if (fs.existsSync(fileOrAddress)) {
        console.log(`\n🔍 Reading Solidity source file from ${fileOrAddress}...`);
        codeToAudit = fs.readFileSync(path.resolve(process.cwd(), fileOrAddress), 'utf-8');
      } else {
        codeToAudit = `// Sample contract audit
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TokenVault {
    mapping(address => uint256) public balances;
    function deposit() public payable { balances[msg.sender] += msg.value; }
    function withdraw(uint256 amount) public {
        require(balances[msg.sender] >= amount);
        (bool s, ) = msg.sender.call{value: amount}("");
        require(s);
        balances[msg.sender] -= amount;
    }
}`;
      }

      console.log('🛡️  Running Northveil Static Code & Backdoor Security Scanner...');
      try {
        const data = await postApi('/api/v1/tools/audit_smart_contract', {
          code: codeToAudit,
        });

        console.log(`\n📊 AUDIT RESULTS (Security Score: ${data.securityScore}/100 [${data.status}])`);
        console.log('-------------------------------------------------------------');
        if (data.vulnerabilities && data.vulnerabilities.length > 0) {
          data.vulnerabilities.forEach((v: any, i: number) => {
            console.log(`[${i + 1}] [${v.severity?.toUpperCase()}] ${v.title}`);
            console.log(`    Detail: ${v.description}`);
            if (v.recommendation) console.log(`    Fix:    ${v.recommendation}`);
            console.log('    -----------------------------------------------------');
          });
        } else {
          console.log('✅ No critical or high severity vulnerabilities detected.');
        }
      } catch (err: any) {
        console.error('\n❌ Audit Error:', err.message);
      }
    });
}
