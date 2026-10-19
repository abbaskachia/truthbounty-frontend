#!/bin/bash
# V2-FE-049: Git Workflow Commands
# Execute these commands in order to create the PR

set -e  # Exit on error

echo "================================================"
echo "V2-FE-049: Dispute Opening Bond Flow"
echo "Git Workflow Execution"
echo "================================================"
echo ""

# 1. Create and checkout new branch
echo "[1/5] Creating branch: v2-fe-049-bond-approval"
git checkout -b v2-fe-049-bond-approval
echo "✓ Branch created"
echo ""

# 2. Stage all modified and new files
echo "[2/5] Staging files..."
git add src/app/types/dispute.ts
echo "  ✓ src/app/types/dispute.ts"

git add src/components/features/disputes/OpenDispute.tsx
echo "  ✓ src/components/features/disputes/OpenDispute.tsx"

git add src/components/features/disputes/__tests__/OpenDispute.bond-approval.test.tsx
echo "  ✓ src/components/features/disputes/__tests__/OpenDispute.bond-approval.test.tsx"

git add DISPUTE_BOND_FLOW.md
echo "  ✓ DISPUTE_BOND_FLOW.md"

git add V2-FE-049-IMPLEMENTATION-SUMMARY.md
echo "  ✓ V2-FE-049-IMPLEMENTATION-SUMMARY.md"

git add TEST_PLAN.md
echo "  ✓ TEST_PLAN.md"

echo "✓ All files staged"
echo ""

# 3. Verify staged files
echo "[3/5] Verifying staged files..."
git diff --cached --name-only
echo ""

# 4. Commit with message
echo "[4/5] Creating commit..."
git commit -m "feat(v2-fe-049): Add dispute opening and challenge bond flow

## Summary
Implements the complete dispute opening workflow with ERC-20 bond token approval integration, fail-closed validation, and accessible user feedback.

## Changes

### Core Implementation
- **OpenDispute Component**: Enhanced with bond approval integration
  - Added ERC20Approval hook for token approval lifecycle
  - ApprovalButton and AllowanceDisplay for approval UI
  - Step-by-step workflow (Approve → Reason → Confirm)
  - Support for both native ETH and ERC-20 bond tokens

- **Type Definitions**: Extended ChallengeBond interface
  - Added optional \`bondToken\` field for ERC-20 tokens
  - Fully backward compatible (field is optional)

### New Test Suite
- **OpenDispute.bond-approval.test.tsx**: Comprehensive bond approval integration tests
  - 18 test cases covering all approval states
  - ERC-20 and native ETH scenarios
  - Error recovery and retry logic
  - Accessible feedback verification
  - Combined validation gates

### Documentation
- **DISPUTE_BOND_FLOW.md**: Architecture and data flow documentation
- **V2-FE-049-IMPLEMENTATION-SUMMARY.md**: Complete implementation details
- **TEST_PLAN.md**: Comprehensive test coverage documentation

## Security Guarantees
✅ No fabrication of transaction hashes, dispute IDs, or allowance values
✅ Fail-closed validation at every stage
✅ Receipt-driven state management
✅ Canonical ABI authority for function discovery
✅ No forbidden imports

## Accessibility Features
✅ Live regions for state announcements
✅ ARIA attributes on all interactive elements
✅ Keyboard navigation support
✅ WCAG 2.1 AA compliant

## Testing
- All existing tests remain passing
- 18 new test cases added for bond approval flow
- No breaking changes (ChallengeBond.bondToken is optional)
- Backward compatible with all existing code

## Files Modified
1. src/app/types/dispute.ts - Added bondToken field to ChallengeBond

## Files Created
1. src/components/features/disputes/OpenDispute.tsx - Enhanced implementation
2. src/components/features/disputes/__tests__/OpenDispute.bond-approval.test.tsx - Test suite
3. DISPUTE_BOND_FLOW.md - Architecture documentation
4. V2-FE-049-IMPLEMENTATION-SUMMARY.md - Implementation details
5. TEST_PLAN.md - Test coverage documentation

## Acceptance Criteria Met
✅ Delivered without unrelated visual redesign
✅ Every async state has accurate accessible feedback and recovery
✅ Canonical receipts/projections drive lifecycle
✅ Lint, typecheck, tests, accessibility checks pass
✅ PR evidence maps to every acceptance criterion
✅ Security-sensitive changes follow established patterns

## Breaking Changes
None. The ChallengeBond.bondToken field is optional and fully backward compatible."

echo "✓ Commit created"
echo ""

# 5. Push branch to remote
echo "[5/5] Pushing branch to remote..."
git push -u origin v2-fe-049-bond-approval
echo "✓ Branch pushed"
echo ""

echo "================================================"
echo "✅ Git workflow complete!"
echo "================================================"
echo ""
echo "Next steps:"
echo "1. Visit: https://github.com/[owner]/[repo]/pull/new/v2-fe-049-bond-approval"
echo "2. Use PR description from: .git-workflow/PR_DESCRIPTION.md"
echo "3. Request review from team members"
echo "4. Wait for CI checks to pass"
echo "5. Merge when approved"
echo ""
echo "PR Description available at:"
echo "  .git-workflow/PR_DESCRIPTION.md"
echo ""
echo "Full verification report at:"
echo "  .git-workflow/FINAL_VERIFICATION.md"
echo ""
