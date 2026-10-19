/**
 * Hook for fetching dispute context (provisional outcome, deadline, bond, wallet position)
 * Provides all data needed to decide whether to open a dispute/challenge
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAccount, useBlockNumber, useChainId } from 'wagmi';
import {
  ProvisionalOutcome,
  DisputeDeadline,
  ChallengeBond,
  DisputeWalletPosition,
  DisputeContext,
} from '@/app/types/dispute';
import { getReleaseChainId } from '@/lib/contracts/registry';

interface UseDisputeContextConfig {
  claimId: string;
  contractAddress: string;
  expectedChainId?: number;
  pollInterval?: number; // ms, default 10000 (10s)
  enabled?: boolean;
}

interface DisputeContextResult {
  context: DisputeContext | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const OPTIMISM_MAINNET_CHAIN_ID = 10;
const OPTIMISM_SEPOLIA_CHAIN_ID = 11155420;
const DEFAULT_POLL_INTERVAL = 10000; // 10 seconds

/**
 * Hook for fetching complete dispute context
 * Combines provisional outcome, deadline, bond, and wallet eligibility
 */
export function useDisputeContext(
  config: UseDisputeContextConfig
): DisputeContextResult {
  const {
    claimId,
    contractAddress,
    expectedChainId = getReleaseChainId(),
    pollInterval = DEFAULT_POLL_INTERVAL,
    enabled = true,
  } = config;

  const { address: userAddress, isConnected } = useAccount();
  const currentChainId = useChainId();
  const { data: blockNumber } = useBlockNumber({ watch: true });

  const [context, setContext] = useState<DisputeContext | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch provisional outcome from contract/indexer
   * 
   * BLOCKED: Requires V2-FE-XXX (provisional outcome indexer or contract readouts)
   * which is not yet implemented. This will remain not-implemented until that
   * dependency is delivered.
   */
  const fetchProvisionalOutcome = useCallback(
    async (claimIdParam: string): Promise<ProvisionalOutcome> => {
      throw new Error(
        'Provisional outcome read is not yet implemented. ' +
        'Blocked on backend indexer for canonical provisional outcome state. ' +
        'Issue: https://github.com/DigiNodes/truthbounty-frontend/issues/321'
      );
    },
    []
  );

  /**
   * Fetch dispute deadline from contract/indexer
   * 
   * BLOCKED: Requires V2-FE-XXX (dispute deadline calculation) which is not yet
   * implemented. This will remain not-implemented until that dependency is delivered.
   */
  const fetchDisputeDeadline = useCallback(
    async (
      claimIdParam: string,
      currentBlockNum: number
    ): Promise<DisputeDeadline> => {
      throw new Error(
        'Dispute deadline read is not yet implemented. ' +
        'Blocked on backend indexer for canonical dispute deadline state. ' +
        'Issue: https://github.com/DigiNodes/truthbounty-frontend/issues/321'
      );
    },
    []
  );

  /**
   * Fetch challenge bond requirements from contract
   * 
   * BLOCKED: Requires V2-FE-XXX (challenge bond configuration) which is not yet
   * implemented. This will remain not-implemented until that dependency is delivered.
   */
  const fetchChallengeBond = useCallback(
    async (claimIdParam: string): Promise<ChallengeBond> => {
      throw new Error(
        'Challenge bond read is not yet implemented. ' +
        'Blocked on backend indexer for canonical challenge bond configuration. ' +
        'Issue: https://github.com/DigiNodes/truthbounty-frontend/issues/321'
      );
    },
    []
  );

  /**
   * Fetch wallet position and eligibility
   * 
   * BLOCKED: Requires V2-FE-XXX (wallet balance and participation state) which is
   * not yet implemented. This will remain not-implemented until that dependency is delivered.
   */
  const fetchWalletPosition = useCallback(
    async (
      claimIdParam: string,
      bondAmount: string,
      walletAddress: string
    ): Promise<DisputeWalletPosition> => {
      throw new Error(
        'Wallet position read is not yet implemented. ' +
        'Blocked on backend indexer for canonical wallet state (balance, participation). ' +
        'Issue: https://github.com/DigiNodes/truthbounty-frontend/issues/321'
      );
    },
    []
  );

  /**
   * Compute eligibility from context components
   */
  const computeEligibility = useCallback(
    (
      outcome: ProvisionalOutcome,
      deadline: DisputeDeadline,
      bond: ChallengeBond,
      position: DisputeWalletPosition,
      walletConnected: boolean,
      correctChain: boolean
    ): { isEligible: boolean; ineligibilityReason?: string } => {
      if (!walletConnected) {
        return {
          isEligible: false,
          ineligibilityReason: 'Wallet not connected',
        };
      }

      if (!correctChain) {
        return {
          isEligible: false,
          ineligibilityReason: `Wrong network. Expected chain ${expectedChainId}`,
        };
      }

      if (!outcome.isProvisional) {
        return {
          isEligible: false,
          ineligibilityReason: 'Outcome already finalized',
        };
      }

      if (!deadline.isWindowOpen) {
        return {
          isEligible: false,
          ineligibilityReason: 'Dispute window has closed',
        };
      }

      if (deadline.hasActiveDispute) {
        return {
          isEligible: false,
          ineligibilityReason: 'Dispute already opened for this claim',
        };
      }

      if (!position.hasSufficientBalance) {
        return {
          isEligible: false,
          ineligibilityReason: `Insufficient balance. Need ${bond.bondAmount} wei`,
        };
      }

      if (position.hasOpenedDispute) {
        return {
          isEligible: false,
          ineligibilityReason: 'You have already opened a dispute for this claim',
        };
      }

      return { isEligible: true };
    },
    [expectedChainId]
  );

  /**
   * Fetch complete dispute context
   */
  const fetchContext = useCallback(async () => {
    if (!enabled) return;
    if (!claimId) {
      setError('Claim ID is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Validate configuration
      if (!contractAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
        throw new Error('Invalid contract address format');
      }

      const currentBlockNum = blockNumber ? Number(blockNumber) : 12345678;

      // Fetch all context components in parallel
      const [outcome, deadline, bond] = await Promise.all([
        fetchProvisionalOutcome(claimId),
        fetchDisputeDeadline(claimId, currentBlockNum),
        fetchChallengeBond(claimId),
      ]);

      // Fetch wallet position (requires bond amount)
      const position = userAddress
        ? await fetchWalletPosition(claimId, bond.bondAmount, userAddress)
        : ({
            claimId,
            userAddress: '',
            canChallenge: false,
            hasParticipatedInFirstRound: false,
            hasOpenedDispute: false,
            currentBalance: '0',
            hasSufficientBalance: false,
            balanceAfterBond: '0',
          } as DisputeWalletPosition);

      // Compute eligibility
      const walletConnected = isConnected && !!userAddress;
      const correctChain = currentChainId === expectedChainId;
      const { isEligible, ineligibilityReason } = computeEligibility(
        outcome,
        deadline,
        bond,
        position,
        walletConnected,
        correctChain
      );

      // Assemble complete context
      const fullContext: DisputeContext = {
        provisionalOutcome: outcome,
        deadline,
        bond,
        walletPosition: position,
        isEligible,
        ineligibilityReason,
      };

      setContext(fullContext);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to fetch dispute context';
      
      // Check if this is a blocking dependency error
      const isBlockingDependency = errorMsg.includes('not yet implemented') && errorMsg.includes('Blocked on');
      
      if (isBlockingDependency) {
        setError(
          'Dispute opening is temporarily unavailable. ' +
          'The canonical state backend has not been integrated. ' +
          'Please check back later.'
        );
      } else {
        setError(errorMsg);
      }
      
      setContext(null);
    } finally {
      setIsLoading(false);
    }
  }, [
    enabled,
    claimId,
    contractAddress,
    blockNumber,
    userAddress,
    isConnected,
    currentChainId,
    expectedChainId,
    fetchProvisionalOutcome,
    fetchDisputeDeadline,
    fetchChallengeBond,
    fetchWalletPosition,
    computeEligibility,
  ]);

  // Initial fetch
  useEffect(() => {
    void fetchContext();
  }, [fetchContext]);

  // Poll for updates
  useEffect(() => {
    if (!enabled || pollInterval <= 0) return;

    const interval = setInterval(() => {
      void fetchContext();
    }, pollInterval);

    return () => clearInterval(interval);
  }, [enabled, pollInterval, fetchContext]);

  // Refetch when block number changes (for deadline updates)
  useEffect(() => {
    if (blockNumber && context) {
      void fetchContext();
    }
  }, [blockNumber]);

  return {
    context,
    isLoading,
    error,
    refetch: fetchContext,
  };
}

/**
 * Utility: Check if claim is eligible for dispute
 */
export function canOpenDispute(context: DisputeContext | null): boolean {
  if (!context) return false;
  return context.isEligible;
}

/**
 * Utility: Get time remaining in dispute window (human-readable)
 * Canonical implementation in @/lib/format
 */
export { getDisputeTimeRemaining } from '@/lib/format';

