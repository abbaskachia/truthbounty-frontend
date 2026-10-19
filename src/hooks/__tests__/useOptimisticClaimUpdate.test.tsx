import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { queryKeys } from "@/app/queries/queryKeys";
import { useOptimisticClaimUpdate } from "@/hooks/useRealtimeClaims";
import type { TransactionStatus } from "@/lib/transaction-machine/transaction-machine.types";

const CLAIM_ID = "claim-rollback";
const claim = { id: CLAIM_ID, status: "OPEN", title: "Canonical claim" };

function setup(status: TransactionStatus = "idle") {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  queryClient.setQueryData(queryKeys.claims.detail(CLAIM_ID), claim);
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const hook = renderHook(
    ({ transactionStatus }) =>
      useOptimisticClaimUpdate(CLAIM_ID, transactionStatus),
    { initialProps: { transactionStatus: status }, wrapper },
  );

  return { ...hook, queryClient };
}

describe("useOptimisticClaimUpdate", () => {
  it.each(["reverted", "replaced", "dropped", "reorged"] as const)(
    "restores the prior claim on %s",
    async (failureStatus) => {
      const { result, rerender, queryClient } = setup();

      await act(async () => {
        await result.current.optimisticUpdate("DISPUTED");
      });
      expect(
        queryClient.getQueryData(queryKeys.claims.detail(CLAIM_ID)),
      ).toMatchObject({
        status: "DISPUTED",
      });

      rerender({ transactionStatus: "submitted" });
      rerender({ transactionStatus: failureStatus });

      await waitFor(() => {
        expect(
          queryClient.getQueryData(queryKeys.claims.detail(CLAIM_ID)),
        ).toEqual(claim);
      });
    },
  );

  it("restores the snapshot when the wallet rejects the signature", async () => {
    const { result, rerender, queryClient } = setup();

    await act(async () => {
      await result.current.optimisticUpdate("UNDER_REVIEW");
    });
    rerender({ transactionStatus: "preparing" });
    rerender({ transactionStatus: "signature-requested" });
    rerender({ transactionStatus: "idle" });

    await waitFor(() => {
      expect(
        queryClient.getQueryData(queryKeys.claims.detail(CLAIM_ID)),
      ).toEqual(claim);
    });
  });

  it("drops the optimistic value on finalization and returns to canonical data", async () => {
    const { result, rerender, queryClient } = setup();

    await act(async () => {
      await result.current.optimisticUpdate("VERIFIED");
    });
    rerender({ transactionStatus: "submitted" });
    rerender({ transactionStatus: "finalized" });

    await waitFor(() => {
      expect(
        queryClient.getQueryData(queryKeys.claims.detail(CLAIM_ID)),
      ).toEqual(claim);
    });
  });

  it("does not overwrite a newer canonical projection while rolling back", async () => {
    const { result, rerender, queryClient } = setup();

    await act(async () => {
      await result.current.optimisticUpdate("DISPUTED");
    });
    const canonicalProjection = { ...claim, status: "VERIFIED" };
    queryClient.setQueryData(
      queryKeys.claims.detail(CLAIM_ID),
      canonicalProjection,
    );

    rerender({ transactionStatus: "submitted" });
    rerender({ transactionStatus: "dropped" });

    await waitFor(() => {
      expect(
        queryClient.getQueryData(queryKeys.claims.detail(CLAIM_ID)),
      ).toEqual(canonicalProjection);
    });
  });

  it("does not invent a claim when the read model is empty or malformed", async () => {
    const { result, queryClient, unmount } = setup();
    queryClient.removeQueries({
      queryKey: queryKeys.claims.detail(CLAIM_ID),
      exact: true,
    });

    await act(async () => {
      await result.current.optimisticUpdate("DISPUTED");
    });
    expect(
      queryClient.getQueryData(queryKeys.claims.detail(CLAIM_ID)),
    ).toBeUndefined();

    queryClient.setQueryData(queryKeys.claims.detail(CLAIM_ID), {
      id: CLAIM_ID,
      status: "UNTRUSTED",
    });
    await act(async () => {
      await result.current.optimisticUpdate("DISPUTED");
    });
    expect(queryClient.getQueryData(queryKeys.claims.detail(CLAIM_ID))).toEqual(
      {
        id: CLAIM_ID,
        status: "UNTRUSTED",
      },
    );
    unmount();
  });

  it("can roll back and recover with a later optimistic attempt", async () => {
    const { result, queryClient } = setup();

    await act(async () => {
      await result.current.optimisticUpdate("DISPUTED");
      await result.current.rollback();
    });
    expect(queryClient.getQueryData(queryKeys.claims.detail(CLAIM_ID))).toEqual(
      claim,
    );

    await act(async () => {
      await result.current.optimisticUpdate("UNDER_REVIEW");
    });
    expect(
      queryClient.getQueryData(queryKeys.claims.detail(CLAIM_ID)),
    ).toMatchObject({
      status: "UNDER_REVIEW",
    });
  });
});
