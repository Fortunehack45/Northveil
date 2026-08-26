export type UUID = string;
export type HexAddress = `0x${string}`;
export type HexData = `0x${string}`;

export enum PolicyError {
  CLIENT_REVOKED = 'CLIENT_REVOKED',
  GRANT_EXPIRED = 'GRANT_EXPIRED',
  CHAIN_NOT_PERMITTED = 'CHAIN_NOT_PERMITTED',
  OPERATION_NOT_PERMITTED = 'OPERATION_NOT_PERMITTED',
  SIMULATION_REVERTED = 'SIMULATION_REVERTED',
  RISK_SCORE_EXCEEDED = 'RISK_SCORE_EXCEEDED',
  DESTINATION_NOT_ALLOWLISTED = 'DESTINATION_NOT_ALLOWLISTED',
  CAP_EXCEEDED = 'CAP_EXCEEDED',
  DAILY_CAP_EXCEEDED = 'DAILY_CAP_EXCEEDED',
  POLICY_DENIED = 'POLICY_DENIED',
}

export interface PolicyDecision {
  allowed: boolean;
  requiresApproval?: boolean;
  decision: 'AUTO_ALLOWED' | 'APPROVAL_REQUIRED' | 'POLICY_DENIED';
  error?: PolicyError;
  reason?: string;
}

export interface DestinationPolicy {
  mode: 'ANY' | 'ALLOWLIST_ONLY' | 'NONE';
  allowlist: string[];
}

export interface ContractCallPolicy {
  allowed_contracts: Array<{
    address: string;
    allowed_selectors?: string[];
    deny_selectors?: string[];
  }>;
  disallow_unlimited_allowances: boolean;
  disallow_admin_selectors: boolean;
}

export interface SpendLimits {
  per_transaction_usd: number;
  daily_limit_usd: number;
  weekly_limit_usd?: number;
  current_daily_spend_usd: number;
  current_weekly_spend_usd?: number;
  reset_daily_at?: string;
  native_caps?: Record<string, string>;
}

export interface SimulationGate {
  require_simulation_success: boolean;
  max_risk_score: number;
}

export interface Grant {
  grant_id: string;
  agent_client_id: string;
  wallet_id: string;
  created_at: string;
  expires_at?: string | null;
  approval_mode: 'ALWAYS_APPROVE' | 'APPROVE_ABOVE_LIMIT' | 'AUTONOMOUS_WITHIN_POLICY';
  allowed_operations: Array<
    | 'read_balance'
    | 'list_nfts'
    | 'simulate_tx'
    | 'sign_tx'
    | 'broadcast_tx'
    | 'deploy_contract'
    | 'sign_message'
    | 'request_payment_token'
    | 'read_secret'
  >;
  allowed_chains: number[];
  destination_policy: DestinationPolicy;
  contract_call_policy?: ContractCallPolicy;
  spend_limits: SpendLimits;
  simulation_gate: SimulationGate;
  is_active: boolean;
}

export interface OperationPayload {
  operationType: string;
  chainId: number;
  from: string;
  to: string;
  valueWei: string;
  valueUsd: number;
  dataHex: string;
  selector?: string;
  simulation: {
    success: boolean;
    riskScore: number;
    gasUsed?: number;
    revertReason?: string;
  };
  isFirstSendToAddress?: boolean;
}

export interface UnsignedTxPreview {
  chainId: number;
  from: string;
  to: string;
  valueWei: string;
  dataHex: string;
  decodedCalldata?: {
    functionName: string;
    params: Record<string, unknown>;
  };
  estimatedGas: string;
  simulationSuccess: boolean;
  simulationWarnings: string[];
}

export interface ApprovalProof {
  approvalToken: string;
  passkeySignature?: string;
  clientSignature?: string;
}

export interface TxResult {
  txHash: string;
  chainId: number;
  nonce: number;
  broadcastTimestamp: Date;
}
