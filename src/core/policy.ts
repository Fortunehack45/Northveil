import crypto from 'crypto';
import { Grant, OperationPayload, PolicyDecision, PolicyError } from './types';

export class PolicyEngine {
  /**
   * Generates the canonical hash binding the exact operation parameters.
   */
  public static computePayloadHash(params: {
    chainId: number;
    from: string;
    to: string;
    valueWei: string;
    dataHex: string;
    noncePolicy: number;
    deadline: number;
    walletId: string;
    clientId: string;
  }): string {
    const serialized = [
      params.chainId.toString(),
      params.from.toLowerCase(),
      params.to.toLowerCase(),
      params.valueWei,
      params.dataHex.toLowerCase(),
      params.noncePolicy.toString(),
      params.deadline.toString(),
      params.walletId,
      params.clientId,
    ].join(':');

    return crypto.createHash('sha256').update(serialized).digest('hex');
  }

  /**
   * Evaluates an inbound operation against an active Agent Client Grant.
   */
  public evaluate(grant: Grant, op: OperationPayload): PolicyDecision {
    // 1. Check if Grant is active and not expired
    if (!grant.is_active) {
      return { allowed: false, error: PolicyError.CLIENT_REVOKED, decision: 'POLICY_DENIED' };
    }
    if (grant.expires_at && new Date() > new Date(grant.expires_at)) {
      return { allowed: false, error: PolicyError.GRANT_EXPIRED, decision: 'POLICY_DENIED' };
    }

    // 2. Validate Chain Support
    if (!grant.allowed_chains.includes(op.chainId)) {
      return { allowed: false, error: PolicyError.CHAIN_NOT_PERMITTED, decision: 'POLICY_DENIED' };
    }

    // 3. Validate Operation Type
    if (!grant.allowed_operations.includes(op.operationType as any)) {
      return { allowed: false, error: PolicyError.OPERATION_NOT_PERMITTED, decision: 'POLICY_DENIED' };
    }

    // 4. Mandatory Simulation Check
    if (grant.simulation_gate.require_simulation_success && !op.simulation.success) {
      return { allowed: false, error: PolicyError.SIMULATION_REVERTED, decision: 'POLICY_DENIED' };
    }
    if (op.simulation.riskScore > grant.simulation_gate.max_risk_score) {
      return { allowed: false, error: PolicyError.RISK_SCORE_EXCEEDED, decision: 'POLICY_DENIED' };
    }

    // 5. Destination Checks
    if (grant.destination_policy.mode === 'ALLOWLIST_ONLY') {
      const isAllowed = grant.destination_policy.allowlist.some(
        (addr) => addr.toLowerCase() === op.to.toLowerCase()
      );
      if (!isAllowed) {
        return { allowed: false, error: PolicyError.DESTINATION_NOT_ALLOWLISTED, decision: 'POLICY_DENIED' };
      }
    }

    // 6. High-Risk Triggers that FORCE Human Approval
    const isContractDeploy = op.operationType === 'deploy_contract';
    const isUnlimitedApproval =
      op.selector === '0x095ea7b3' &&
      op.dataHex.includes('ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');

    if (op.isFirstSendToAddress || isContractDeploy || isUnlimitedApproval) {
      return { allowed: true, requiresApproval: true, decision: 'APPROVAL_REQUIRED' };
    }

    // 7. Evaluate Approval Mode & Spend Caps
    if (grant.approval_mode === 'ALWAYS_APPROVE') {
      return { allowed: true, requiresApproval: true, decision: 'APPROVAL_REQUIRED' };
    }

    if (grant.approval_mode === 'APPROVE_ABOVE_LIMIT' || grant.approval_mode === 'AUTONOMOUS_WITHIN_POLICY') {
      // Check Per-Tx Cap
      if (op.valueUsd > grant.spend_limits.per_transaction_usd) {
        if (grant.approval_mode === 'AUTONOMOUS_WITHIN_POLICY') {
          return { allowed: false, error: PolicyError.CAP_EXCEEDED, decision: 'POLICY_DENIED' };
        }
        return { allowed: true, requiresApproval: true, decision: 'APPROVAL_REQUIRED' };
      }

      // Check Daily Accrual Cap
      const projectedDailySpend = grant.spend_limits.current_daily_spend_usd + op.valueUsd;
      if (projectedDailySpend > grant.spend_limits.daily_limit_usd) {
        if (grant.approval_mode === 'AUTONOMOUS_WITHIN_POLICY') {
          return { allowed: false, error: PolicyError.DAILY_CAP_EXCEEDED, decision: 'POLICY_DENIED' };
        }
        return { allowed: true, requiresApproval: true, decision: 'APPROVAL_REQUIRED' };
      }

      // Under caps & in policy -> Autonomous execution allowed
      return { allowed: true, requiresApproval: false, decision: 'AUTO_ALLOWED' };
    }

    return { allowed: false, error: PolicyError.POLICY_DENIED, decision: 'POLICY_DENIED' };
  }
}
