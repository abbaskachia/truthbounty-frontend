/**
 * Dispute opening and challenge types for V2 protocol
 * Handles opening challenges against provisional outcomes on Optimism/EVM
 */

/**
 * Provisional outcome from first-round verification
 * This is the outcome being challenged by opening a dispute
 */
export interface ProvisionalOutcome {
  claimId: string;
  
  // First-round verification result
  decision: 'VERIFIED' | 'REJECTED';
  votesFor: number;
  votesAgainst: number;
  totalStake: string; // Wei amount as string
  
  // Outcome finalization
  outcomeAt: string; // ISO 8601 timestamp when outcome was determined
  outcomeBlock: number;
  
  // Settlement state
  isProvisional: boolean; // True if dispute window still open
  isFinalized: boolean; // True if dispute window closed without challenge
}

/**
 * Dispute deadline and challenge window
 */
export interface DisputeDeadline {
  claimId: string;
  
  // Challenge window timestamps
  windowStartTime: string; // ISO 8601
  windowEndTime: string; // ISO 8601
  
  // Time remaining to challenge (in seconds, 0 if expired)
  timeRemaining: number;
  
  // Block-based deadline (for on-chain finality)
  windowEndBlock: number;
  currentBlock: number;
  blocksRemaining: number;
  
  // State flags
  isWindowOpen: boolean; // Can still challenge
  isWindowClosed: boolean; // Too late to challenge
  hasActiveDispute: boolean; // Already challenged
}

/**
 * Challenge bond requirements
 */
export interface ChallengeBond {
  claimId: string;
  
  // Bond amount required to open dispute
  bondAmount: string; // Wei amount as string
  
  // Bond token address (undefined/null for native ETH)
  bondToken?: string;
  
  // Slashing risk if challenge fails
  slashAmount: string; // Wei amount as string
  slashPercentage: number; // e.g., 10 for 10%
  
  // Potential reward if challenge succeeds
  potentialReward: string; // Wei amount as string
  rewardMultiplier: number; // e.g., 1.5 for 1.5x bond
}

/**
 * User's wallet eligibility for opening dispute
 */
export interface DisputeWalletPosition {
  claimId: string;
  userAddress: string;
  
  // Can user open dispute?
  canChallenge: boolean;
  
  // Existing participation checks
  hasParticipatedInFirstRound: boolean; // Participated in verification
  hasOpenedDispute: boolean; // Already opened this dispute
  
  // Balance checks
  currentBalance: string; // Wei amount as string
  hasSufficientBalance: boolean;
  balanceAfterBond: string; // Wei amount remaining after bond
}

/**
 * Complete dispute context for opening challenges
 * Combines provisional outcome, deadline, bond, and wallet position
 */
export interface DisputeContext {
  provisionalOutcome: ProvisionalOutcome;
  deadline: DisputeDeadline;
  bond: ChallengeBond;
  walletPosition: DisputeWalletPosition;
  
  // Computed eligibility
  isEligible: boolean;
  ineligibilityReason?: string;
}

/**
 * Dispute submission status
 */
export type DisputeSubmissionStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'FAILED'
  | 'REVERTED'
  | 'REPLACED'; // Transaction replaced with higher gas

/**
 * Dispute opening submission payload
 */
export interface DisputeSubmissionPayload {
  claimId: string;
  reason: string;
  bondAmount: string; // Wei amount as string
  bondToken?: string; // ERC-20 token address (undefined/null for native ETH)
  userAddress: string;
  
  // Optional metadata
  evidence?: string[]; // URLs or IPFS hashes
}

/**
 * Dispute opening transaction
 */
export interface DisputeTransaction {
  transactionHash: string;
  from: string;
  to: string; // Contract address
  status: DisputeSubmissionStatus;
  
  claimId: string;
  disputeId?: string; // Only available after receipt + log parsing
  reason: string;
  bondAmount: string; // Wei amount as string
  
  timestamp: string; // ISO 8601
  blockNumber?: number;
  
  // Gas details
  gasUsed?: string;
  gasPrice?: string;
  
  // Receipt confirmation
  confirmationStatus: 'pending' | 'confirmed' | 'failed' | 'replaced' | 'reorged';
  blockConfirmed?: number;
  receiptTimestamp?: string; // ISO 8601, when receipt was confirmed
  
  // Bond lock confirmation
  bondLocked: boolean;
  bondLockConfirmedAt?: string; // ISO 8601
}

/**
 * Dispute simulation result
 */
export interface DisputeSimulationResult {
  success: boolean;
  error?: string;
  
  // Gas estimation
  gasEstimate?: string;
  
  // Projected state after dispute opens.
  // `disputeId` is absent until the contract assigns it on-chain; the id is
  // never predicted locally.
  projectedState?: {
    disputeId?: string;
    bondLocked: string;
    newStatus: 'DISPUTED';
  };
  
  // Transaction data
  data?: {
    from: string;
    to: string;
    value?: string;
    calldata: string;
  };
}

/**
 * Dispute validation result
 */
export interface DisputeValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  
  // Validation details
  checks: {
    windowOpen: boolean;
    noActiveDispute: boolean;
    walletConnected: boolean;
    correctChain: boolean;
    sufficientBalance: boolean;
    notParticipatedInFirstRound: boolean; // Some protocols disallow
    bondAmountValid: boolean;
    reasonProvided: boolean;
    contractAddressValid: boolean;
    artifactVersionValid: boolean;
    contractNotPaused: boolean;
  };
}

/**
 * Dispute reconciliation result after confirmation
 */
export interface DisputeReconciliationResult {
  transactionHash: string;
  status: 'confirmed' | 'reverted' | 'timeout' | 'replaced';
  
  // Final state after reconciliation
  disputeId?: string;
  bondLocked: boolean;
  bondAmount: string;
  
  // Updated wallet state
  newBalance: string;
  
  // Error details (if failed)
  error?: string;
  revertReason?: string;
}

// Legacy types (kept for backward compatibility)

export interface ClaimData {
  id: string;
  category: string;
  hash: string;
  status: 'Verified' | 'Disputed' | 'Pending';
  title: string;
  source: string;
  timeAgo: string;
  votesFor: number;
  votesAgainst: number;
  verifiersCount: number;
  confidenceScore: number;
  totalStaked: number;
}

export interface Dispute {
  id: string;
  claimId: string;
  reason: string;
  status: 'OPEN' | 'VOTING' | 'RESOLVED' | 'FAILED' | 'APPEALED';
  proVotes: number;
  conVotes: number; 
  totalStaked: number;
  createdAt: string;
  
  // Appeal information (if dispute has been appealed)
  appealId?: string;
  appealInitiatedAt?: string;
  appealDeadline?: string;
}

export interface CreateDisputePayload {
  claimId: string;
  reason: string;
  initialStake: number;
}

export interface Evidence {
  id: string;
  title: string;
  description: string;
  url: string;
}

export interface TimelineEvent {
  id: string;
  title: string;
  timeAgo: string;
  actor: string;
  isRecent?: boolean;
  type?: string;
}

export interface TopVerifier {
  id: string;
  rank: number;
  name: string;
  staked: string;
  score: number;
}


/**
 * Safely parse a wei amount string to bigint with validation
 * @throws Error if the string is not a valid non-negative integer
 */
export function parseWeiAmount(value: unknown): bigint {
  if (typeof value !== 'string') {
    throw new Error('Amount must be a string');
  }
  
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) {
    throw new Error('Amount must be a non-negative integer (no decimals or scientific notation)');
  }
  
  try {
    const bigintValue = BigInt(trimmed);
    if (bigintValue < 0n) {
      throw new Error('Amount cannot be negative');
    }
    return bigintValue;
  } catch (err) {
    if (err instanceof SyntaxError || (err instanceof Error && err.message.includes('Cannot convert'))) {
      throw new Error('Amount is not a valid number');
    }
    throw err;
  }
}

/**
 * Validate ChallengeBond data for render safety
 * @throws Error if validation fails
 */
export function validateChallengeBond(bond: unknown): asserts bond is ChallengeBond {
  if (!bond || typeof bond !== 'object') {
    throw new Error('Bond must be an object');
  }
  
  const b = bond as Record<string, unknown>;
  
  if (typeof b.claimId !== 'string' || !b.claimId.trim()) {
    throw new Error('Bond must have a valid claimId');
  }
  
  if (typeof b.bondAmount !== 'string' || !b.bondAmount.trim()) {
    throw new Error('Bond must have a bondAmount');
  }
  
  // Try to parse to validate it's a valid wei amount
  parseWeiAmount(b.bondAmount);
  
  if (typeof b.slashAmount !== 'string' || !b.slashAmount.trim()) {
    throw new Error('Bond must have a slashAmount');
  }
  
  parseWeiAmount(b.slashAmount);
  
  if (typeof b.slashPercentage !== 'number' || b.slashPercentage < 0 || b.slashPercentage > 100) {
    throw new Error('Slash percentage must be between 0 and 100');
  }
  
  if (typeof b.potentialReward !== 'string' || !b.potentialReward.trim()) {
    throw new Error('Bond must have a potentialReward');
  }
  
  parseWeiAmount(b.potentialReward);
  
  if (typeof b.rewardMultiplier !== 'number' || b.rewardMultiplier <= 0) {
    throw new Error('Reward multiplier must be positive');
  }
}

/**
 * Validate DisputeContext for render safety
 * @throws Error if validation fails
 */
export function validateDisputeContext(context: unknown): asserts context is DisputeContext {
  if (!context || typeof context !== 'object') {
    throw new Error('Context must be an object');
  }
  
  const c = context as Record<string, unknown>;
  
  // Validate bond
  if (!c.bond) {
    throw new Error('Context must include bond information');
  }
  validateChallengeBond(c.bond);
  
  // Validate wallet position
  if (!c.walletPosition || typeof c.walletPosition !== 'object') {
    throw new Error('Context must include wallet position');
  }
  
  const wp = c.walletPosition as Record<string, unknown>;
  if (typeof wp.userAddress !== 'string' || !wp.userAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
    throw new Error('Invalid user address in wallet position');
  }
  
  if (typeof wp.currentBalance !== 'string' || !wp.currentBalance.trim()) {
    throw new Error('Context must include current balance');
  }
  
  parseWeiAmount(wp.currentBalance);
}
