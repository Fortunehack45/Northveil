/**
 * DEPRECATED: Custodial Signing Service (Migrated to Non-Custodial MPC Control Plane)
 * Re-exports non-custodial MPC/TEE coordination methods from mpcControlPlaneService.ts.
 * All raw private key storage and server-side signing paths have been permanently disabled.
 */

export * from './mpcControlPlaneService.js';

import {
  createMpcWallet,
  stageTransactionRequest,
  approveAndExecuteWithPasskey,
  rejectTransactionRequest,
  evaluateAutonomousScope,
  executeAutonomousTransaction,
  activateKillSwitch,
  deactivateKillSwitch,
} from './mpcControlPlaneService.js';

export const createCustodialWallet = createMpcWallet;
export const createTransactionRequest = stageTransactionRequest;
export const approveAndExecuteTransaction = approveAndExecuteWithPasskey;
export const rejectTransaction = rejectTransactionRequest;
