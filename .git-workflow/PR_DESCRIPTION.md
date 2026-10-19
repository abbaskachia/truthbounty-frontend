# V2-FE-049: Dispute Opening and Challenge Bond Flow

## Overview
This PR implements a complete dispute opening workflow with ERC-20 bond token approval integration for the TruthBounty V2 frontend. The implementation includes fail-closed validation at every stage, accessible user feedback, and comprehensive test coverage.

## Problem Statement
The dispute opening flow required:
1. **Bond Approval Gate**: Support for ERC-20 bond tokens with proper approval lifecycle
2. **Fail-Closed Validation**: Multiple validation checks preventing submission without proper conditions
3. **Accessible Feedback**: Clear, actionable feedback at every stage for all users
4. **Security Guarantees**: No fabrication of state, receipt-driven updates, canonical ABI authority

## Solution

### Core Changes

#### 1. Enhanced OpenDispute Component
- **Bond Approval Integration**: Uses `useERC20Approval` hook for token approval lifecycle
- **Step-by-Step Workflow**: 
  - Step 1: Approve Bond Token (ERC-20 only)
  - Step 2: Reason for Dispute
  - Confirm Dispute Button
- **Native ETH Support**: Automatically detects and skips approval for native ETH bonds
- **Accessible Feedback**: Live regions, ARIA attributes, descriptive labels

#### 2. Type System Enhancement
```typescript
export interface ChallengeBond {
  claimId: string;
  bondAmount: string;
  bondToken?: string;  // NEW: ERC-20 token address (optional)
  slashAmount: string;
  slashPercentage: number;
  potentialReward: string;
  rewardMultiplier: number;
}
```

#### 3. Comprehensive Test Suite
- **18 Test Cases** covering all approval states
- **ERC-20 and Native ETH Scenarios**
- **Error Recovery**: Rejection, timeout, and failure handling
- **Accessible Feedback**: Live region and ARIA attribute verification
- **Combined Validation**: All gates tested together

### Data Flow
```
User Opens Modal
    ↓
Fetch Dispute Context
    ├─ Provisional Outcome
    ├─ Deadline Window
    ├─ Bond Requirements (includes bondToken)
    └─ Wallet Eligibility
    ↓
[If ERC-20 Bond Token]
    ├─ Check Current Allowance
    ├─ Show Approval Button
    ├─ User Approves
    ├─ Wait for Receipt
    └─ Refresh Allowance
    ↓
User Fills Reason
    ↓
User Clicks Confirm
    ↓
Validate All Gates (Context, Wallet, Bond Approval)
    ↓
Simulate Transaction
    ↓
Submit Dispute
    ↓
Wait for Receipt
    ↓
Extract disputeId from Logs
    ↓
Success
```

## Security & Architecture

### Fail-Closed Validation
✅ Context must load successfully
✅ Wallet connected to correct network
✅ Contract address matches canonical release
✅ Bond approval succeeds (ERC-20 tokens)
✅ ABI declares dispute function
✅ All checks before submission allowed

### Receipt-Driven State Management
✅ Allowance refreshed from receipt, not timer
✅ Bond lock confirmed from transaction logs
✅ No optimistic updates
✅ Dispute ID extracted from on-chain events only

### Canonical ABI Authority
✅ Function discovery from pinned ABI
✅ No hardcoded selectors
✅ Fails closed if function not declared

### No Fabrication
✅ Transaction hashes only from wagmi
✅ Dispute IDs from logs only
✅ Allowance values from contract reads only
✅ Never invents success without on-chain confirmation

## Accessibility Features

### Live Regions
- `ApprovalButton` includes polite live region
- State changes announced to screen readers
- Bond approval success announced

### ARIA Attributes
- `aria-busy` during in-flight transactions
- `aria-label` on all interactive elements
- `aria-describedby` linking errors to buttons
- `role="status"` for state announcements
- `role="alert"` for errors

### Keyboard Navigation
- Focus trap during modal
- Tab order: approve → reason → confirm → cancel
- Escape closes modal (when idle)

### Visual + Auditory Feedback
- Color never sole differentiator
- Icons + text for all states
- Spinner + disabled state for loading
- Checkmark + text for success

## Testing

### Test Coverage
- **Unit Tests**: All approval states, combined validation gates, error recovery
- **Integration Tests**: Complete flow context → validate → simulate → submit → reconcile
- **Accessibility Tests**: ARIA attributes, keyboard navigation, screen reader announcements
- **Regression Tests**: Existing tests still pass, no breaking changes

### Test Count
- **New Tests**: 18 (OpenDispute.bond-approval.test.tsx)
- **Existing Tests**: 35+ (dispute opening integration tests)
- **Accessibility Tests**: 10+ (approval components)
- **Total Coverage**: 75+ tests

## Files Changed

### Modified Files
1. **src/app/types/dispute.ts**
   - Added optional `bondToken` field to `ChallengeBond` interface
   - Fully backward compatible

2. **src/components/features/disputes/OpenDispute.tsx**
   - Added bond approval integration
   - Enhanced UI with step labels
   - Added accessible feedback
   - Updated validation gates

### New Files
1. **src/components/features/disputes/__tests__/OpenDispute.bond-approval.test.tsx**
   - 18 comprehensive test cases
   - All approval states covered
   - Error recovery tested
   - Accessibility verified

2. **DISPUTE_BOND_FLOW.md**
   - Architecture documentation
   - Data flow diagrams
   - Testing guide

3. **V2-FE-049-IMPLEMENTATION-SUMMARY.md**
   - Implementation details
   - Security guarantees
   - Acceptance criteria mapping

4. **TEST_PLAN.md**
   - Test coverage documentation
   - Manual testing scenarios
   - Performance benchmarks

## Acceptance Criteria

### ✅ No Unrelated Visual Redesign
- Changes focused on bond approval functionality
- Follows existing modal design patterns
- No typography or layout changes

### ✅ Every Async State Has Accurate Accessible Feedback
- Loading states: Spinners + descriptive text + aria-busy
- Error states: Alert role + retry buttons + aria-describedby
- Success states: Checkmark + announcement + role="status"
- Recovery: Reset button after rejection/error

### ✅ Canonical Receipts Drive Lifecycle
- Allowance refetch triggered by receipt only
- Bond lock confirmed from transaction logs
- No setTimeout or setInterval for state
- Dispute ID extracted from on-chain events

### ✅ All Checks Pass
- TypeScript compiles without errors
- ESLint passes with no violations
- Tests comprehensive and passing
- Accessibility WCAG 2.1 AA compliant
- No artifact drift
- Production build succeeds

### ✅ PR Evidence Maps to Criteria
- This document provides mapping
- Code comments reference requirements
- Tests demonstrate fail-closed behavior
- Documentation explains all validation

### ✅ Security-Sensitive Changes Follow Patterns
- Bond approval uses established `useERC20Approval`
- No new signature flows
- Wagmi delegates all wallet interactions
- Follows existing write-gate validation

## Dependencies
- **V2-FE-016**: ERC-20 approval hooks and UI components
- **V2-FE-100**: Write readiness gate
- **V2-FE-009**: Transaction state machine

## Breaking Changes
**None.** The `ChallengeBond.bondToken` field is optional and fully backward compatible.

## Deployment Checklist
- [x] All tests passing
- [x] TypeScript compiles without errors
- [x] ESLint passes
- [x] Accessibility tests pass
- [x] Production build succeeds
- [x] No console errors
- [x] No mock wallet imports
- [x] No breaking changes

## Reviewer Checklist
- [ ] Security model validated (fail-closed gates)
- [ ] Receipt-driven state confirmed (no timers)
- [ ] Accessible feedback verified (ARIA, live regions)
- [ ] Test coverage adequate (18 new tests)
- [ ] No breaking changes confirmed (optional field)
- [ ] Documentation complete
- [ ] Ready to merge

## Related Issues/PRs
- Depends on: V2-FE-016 (ERC-20 approval hooks)
- Depends on: V2-FE-100 (Write readiness gate)
- Related to: V2-FE-057 (Challenge-specific features)

## Screenshots/Examples

### ERC-20 Bond Approval Flow
```
┌─────────────────────────────────┐
│ Open Dispute                    │
├─────────────────────────────────┤
│                                 │
│ Required Challenge Bond         │
│ 1.0000 ETH                      │
│ Your balance: 5.0000 ETH        │
│                                 │
│ Step 1: Approve Bond Token      │
│ [Approve BOND Button]           │
│                                 │
│ Reason for Dispute *            │
│ [Text area...]                  │
│                                 │
│ [Cancel] [Confirm Dispute]      │
└─────────────────────────────────┘

After Approval:
┌─────────────────────────────────┐
│ Open Dispute                    │
├─────────────────────────────────┤
│                                 │
│ Step 1: Approve Bond Token      │
│ ✓ Bond token approved           │
│                                 │
│ Step 2: Reason for Dispute *    │
│ [Text area...]                  │
│                                 │
│ [Cancel] [Confirm Dispute]      │
└─────────────────────────────────┘
```

### Native ETH Bond Flow
```
┌─────────────────────────────────┐
│ Open Dispute                    │
├─────────────────────────────────┤
│                                 │
│ Required Challenge Bond         │
│ 1.0000 ETH                      │
│ Your balance: 5.0000 ETH        │
│                                 │
│ Reason for Dispute *            │
│ [Text area...]                  │
│                                 │
│ [Cancel] [Confirm Dispute]      │
└─────────────────────────────────┘
```

## Questions?
- Architecture: See `DISPUTE_BOND_FLOW.md`
- Implementation: See `V2-FE-049-IMPLEMENTATION-SUMMARY.md`
- Testing: See `TEST_PLAN.md`
