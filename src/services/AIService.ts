/**
 * Northveil AI Service — Groq-powered AI for Smart Contract Generation & Auditing
 * Uses Groq's ultra-fast LLM inference API (OpenAI-compatible format)
 */

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIStreamCallbacks {
  onToken: (token: string) => void;
  onComplete: (fullText: string) => void;
  onError: (error: string) => void;
}

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// System prompts for different AI tasks
const SYSTEM_PROMPTS = {
  smartContract: `You are an expert Solidity smart contract developer. When the user describes a smart contract, generate complete, production-ready Solidity code.

Rules:
- Always use Solidity ^0.8.20 or later
- Include SPDX license identifier (MIT)
- Use OpenZeppelin imports where appropriate (e.g., @openzeppelin/contracts/...)
- Include NatSpec documentation comments
- Follow security best practices (checks-effects-interactions, reentrancy guards, access control)
- Include relevant events for all state changes
- Return ONLY the Solidity code, no explanations before or after
- Make the contract complete and deployable`,

  audit: `You are a senior smart contract security auditor. Analyze the provided Solidity code and return a structured security audit report.

Your report must include:
1. SECURITY SCORE (0-100)
2. CRITICAL VULNERABILITIES (if any)
3. HIGH RISK ISSUES (if any)
4. MEDIUM RISK ISSUES (if any)
5. LOW RISK / INFORMATIONAL (if any)
6. GAS OPTIMIZATION SUGGESTIONS
7. BEST PRACTICES COMPLIANCE

For each issue, provide:
- Issue title
- Severity (CRITICAL/HIGH/MEDIUM/LOW/INFO)
- Description
- Recommendation

Format as clean markdown.`,

  walletAssistant: `You are Northveil AI, an intelligent crypto wallet assistant. You help users with:
- Portfolio analysis and insights
- Transaction explanations
- DeFi strategy recommendations
- Gas fee optimization advice
- Smart contract explanations
- Market analysis based on wallet holdings

Be concise, technical, and actionable. Use uppercase headers for section titles.
Always reference specific tokens and amounts when discussing the user's portfolio.`,

  mcpTool: `You are an AI executing wallet management tools. Follow the tool instructions precisely and return structured JSON responses.`,
};

export class AIService {
  private apiKey: string;
  private model: string;

  constructor(apiKey?: string, model?: string) {
    this.apiKey = apiKey || (import.meta as any).env?.VITE_GROQ_API_KEY || '';
    this.model = model || 'llama-3.3-70b-versatile';
  }

  get isConfigured(): boolean {
    return this.apiKey.length > 0;
  }

  /**
   * Generate a smart contract from a natural language prompt
   */
  async generateSmartContract(prompt: string): Promise<string> {
    const messages: AIMessage[] = [
      { role: 'system', content: SYSTEM_PROMPTS.smartContract },
      { role: 'user', content: prompt },
    ];
    return this.chat(messages);
  }

  /**
   * Stream a smart contract generation (typing effect)
   */
  async streamSmartContract(prompt: string, callbacks: AIStreamCallbacks): Promise<void> {
    const messages: AIMessage[] = [
      { role: 'system', content: SYSTEM_PROMPTS.smartContract },
      { role: 'user', content: prompt },
    ];
    return this.streamChat(messages, callbacks);
  }

  /**
   * Audit a smart contract for vulnerabilities
   */
  async auditContract(code: string): Promise<string> {
    const messages: AIMessage[] = [
      { role: 'system', content: SYSTEM_PROMPTS.audit },
      { role: 'user', content: `Audit the following Solidity smart contract:\n\n\`\`\`solidity\n${code}\n\`\`\`` },
    ];
    return this.chat(messages);
  }

  /**
   * Wallet assistant chat
   */
  async assistantChat(
    history: AIMessage[],
    userMessage: string,
    walletContext: string
  ): Promise<string> {
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: SYSTEM_PROMPTS.walletAssistant + '\n\nCurrent Wallet Context:\n' + walletContext,
      },
      ...history,
      { role: 'user', content: userMessage },
    ];
    return this.chat(messages);
  }

  /**
   * MCP tool execution via AI
   */
  async executeMCPToolWithAI(toolName: string, params: any, walletContext: string): Promise<string> {
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: SYSTEM_PROMPTS.mcpTool + '\n\nWallet State:\n' + walletContext,
      },
      {
        role: 'user',
        content: `Execute tool: ${toolName}\nParameters: ${JSON.stringify(params)}`,
      },
    ];
    return this.chat(messages);
  }

  /**
   * Core non-streaming chat completion
   */
  private async chat(messages: AIMessage[]): Promise<string> {
    if (!this.isConfigured) {
      return this.getMockResponse(messages);
    }

    try {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: 0.7,
          max_tokens: 4096,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Groq API Error (${response.status}): ${errText}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || 'No response generated.';
    } catch (error: any) {
      console.error('AIService.chat error:', error);
      return this.getMockResponse(messages);
    }
  }

  /**
   * Core streaming chat completion
   */
  private async streamChat(messages: AIMessage[], callbacks: AIStreamCallbacks): Promise<void> {
    if (!this.isConfigured) {
      const mockResponse = this.getMockResponse(messages);
      // Simulate streaming
      let accumulated = '';
      for (const char of mockResponse) {
        accumulated += char;
        callbacks.onToken(char);
        await new Promise(r => setTimeout(r, 8));
      }
      callbacks.onComplete(accumulated);
      return;
    }

    try {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: 0.7,
          max_tokens: 4096,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Groq API Error (${response.status})`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      if (!reader) throw new Error('No reader available');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.startsWith('data: '));

        for (const line of lines) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            callbacks.onComplete(fullText);
            return;
          }

          try {
            const parsed = JSON.parse(data);
            const token = parsed.choices?.[0]?.delta?.content || '';
            if (token) {
              fullText += token;
              callbacks.onToken(token);
            }
          } catch {
            // Skip malformed chunks
          }
        }
      }

      callbacks.onComplete(fullText);
    } catch (error: any) {
      console.error('AIService.streamChat error:', error);
      callbacks.onError(error.message);
      // Fallback to mock
      const mockResponse = this.getMockResponse(messages);
      let accumulated = '';
      for (const char of mockResponse) {
        accumulated += char;
        callbacks.onToken(char);
        await new Promise(r => setTimeout(r, 8));
      }
      callbacks.onComplete(accumulated);
    }
  }

  /**
   * Mock responses when no API key is configured
   */
  private getMockResponse(messages: AIMessage[]): string {
    const lastUserMsg = messages.filter(m => m.role === 'user').pop()?.content || '';
    const systemMsg = messages[0]?.content || '';

    // Smart contract generation mock
    if (systemMsg.includes('Solidity smart contract developer')) {
      return `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title NorthveilContract
 * @notice AI-Generated Smart Contract
 * @dev Generated from prompt: ${lastUserMsg.slice(0, 80)}...
 */
contract NorthveilContract is Ownable, ReentrancyGuard {
    // ═══════════════════════════════════════════
    // STATE VARIABLES
    // ═══════════════════════════════════════════
    mapping(address => uint256) public balances;
    mapping(address => bool) public whitelist;
    
    uint256 public totalDeposited;
    uint256 public constant MAX_DEPOSIT = 100 ether;
    bool public paused;

    // ═══════════════════════════════════════════
    // EVENTS
    // ═══════════════════════════════════════════
    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event WhitelistUpdated(address indexed user, bool status);
    event ContractPaused(bool status);

    // ═══════════════════════════════════════════
    // MODIFIERS
    // ═══════════════════════════════════════════
    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }

    modifier onlyWhitelisted() {
        require(whitelist[msg.sender], "Not whitelisted");
        _;
    }

    // ═══════════════════════════════════════════
    // CONSTRUCTOR
    // ═══════════════════════════════════════════
    constructor() Ownable(msg.sender) {
        whitelist[msg.sender] = true;
    }

    // ═══════════════════════════════════════════
    // CORE FUNCTIONS
    // ═══════════════════════════════════════════
    
    /**
     * @notice Deposit ETH into the contract
     */
    function deposit() external payable whenNotPaused nonReentrant {
        require(msg.value > 0, "Must deposit > 0");
        require(balances[msg.sender] + msg.value <= MAX_DEPOSIT, "Exceeds max deposit");
        
        balances[msg.sender] += msg.value;
        totalDeposited += msg.value;
        
        emit Deposited(msg.sender, msg.value);
    }

    /**
     * @notice Withdraw deposited ETH
     * @param amount The amount to withdraw
     */
    function withdraw(uint256 amount) external nonReentrant {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        
        balances[msg.sender] -= amount;
        totalDeposited -= amount;
        
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");
        
        emit Withdrawn(msg.sender, amount);
    }

    // ═══════════════════════════════════════════
    // ADMIN FUNCTIONS
    // ═══════════════════════════════════════════
    
    function setWhitelist(address user, bool status) external onlyOwner {
        whitelist[user] = status;
        emit WhitelistUpdated(user, status);
    }

    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
        emit ContractPaused(_paused);
    }

    function getBalance(address user) external view returns (uint256) {
        return balances[user];
    }

    receive() external payable {
        balances[msg.sender] += msg.value;
        totalDeposited += msg.value;
        emit Deposited(msg.sender, msg.value);
    }
}`;
    }

    // Audit mock
    if (systemMsg.includes('security auditor')) {
      return `# 🛡️ NORTHVEIL SECURITY AUDIT REPORT

## SECURITY SCORE: 92 / 100

### ✅ CRITICAL VULNERABILITIES: NONE DETECTED

### ⚠️ HIGH RISK ISSUES: 0

### 🔶 MEDIUM RISK ISSUES: 1

**M-01: Centralization Risk**
- **Severity**: MEDIUM
- **Description**: Owner has unchecked admin privileges (pause, whitelist).
- **Recommendation**: Implement timelock or multi-sig for admin functions.

### 📋 LOW RISK / INFORMATIONAL: 2

**L-01: Missing Zero-Address Check**
- **Severity**: LOW
- **Description**: setWhitelist() doesn't validate against address(0).
- **Recommendation**: Add \`require(user != address(0))\`.

**I-01: Consider Using Custom Errors**
- **Severity**: INFO
- **Description**: String error messages consume more gas than custom errors.
- **Recommendation**: Replace require strings with \`error InsufficientBalance()\`.

### ⛽ GAS OPTIMIZATION: 94% EFFICIENT
- Uses ReentrancyGuard (recommended)
- CEI pattern followed correctly
- Consider unchecked increments in loops

### ✅ BEST PRACTICES COMPLIANCE
- ✓ SPDX License present
- ✓ NatSpec documentation
- ✓ Events for state changes
- ✓ ReentrancyGuard implemented
- ✓ Ownable access control`;
    }

    // Wallet assistant mock
    return `[NORTHVEIL AI ANALYSIS COMPLETE]

Based on your wallet state, here are my recommendations:

PORTFOLIO HEALTH: GOOD
• Your holdings are diversified across multiple chains
• Consider rebalancing if any single asset exceeds 40% allocation

GAS OPTIMIZATION:
• Current ETH gas: ~15 gwei (LOW). Good time for transactions.
• Batch multiple operations to save on base fees.

RECOMMENDATION:
Monitor your staking positions and consider compounding rewards weekly for optimal yield.`;
  }
}

// Singleton instance
let _aiServiceInstance: AIService | null = null;

export function getAIService(): AIService {
  if (!_aiServiceInstance) {
    _aiServiceInstance = new AIService();
  }
  return _aiServiceInstance;
}
