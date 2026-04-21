"use client";
import { create } from "zustand";
import type { TierLevel, TierRequest } from "@/lib/tier-requests/types";
import { MOCK_TIER_REQUESTS } from "@/lib/mock/tierRequests";

interface State {
  requests: TierRequest[];
  selectedRequestId: string | null;
  auditDrawerRequestId: string | null;
  lastApprovedAction: { facilityName: string; toTier: TierLevel } | null;
}

interface Actions {
  selectRequest: (id: string | null) => void;
  openAuditDrawer: (id: string) => void;
  closeAuditDrawer: () => void;
  approveRequest: (id: string) => void;
  deferRequest: (id: string, reason: string) => void;
  grantComplimentary: (facilityId: string, targetTier: TierLevel, expiryDate: string, notes: string) => void;
  clearApprovedAction: () => void;
}

export const useTierRequests = create<State & Actions>((set, get) => ({
  requests: MOCK_TIER_REQUESTS,
  selectedRequestId: null,
  auditDrawerRequestId: null,
  lastApprovedAction: null,

  selectRequest: (id) => set({ selectedRequestId: id }),

  openAuditDrawer: (id) => set({ auditDrawerRequestId: id }),

  closeAuditDrawer: () => set({ auditDrawerRequestId: null }),

  approveRequest: (id) => {
    const req = get().requests.find((r) => r.id === id);
    if (!req) return;
    set((s) => ({
      requests: s.requests.filter((r) => r.id !== id),
      selectedRequestId: null,
      lastApprovedAction: { facilityName: req.facility.name, toTier: req.toTier },
    }));
  },

  deferRequest: (id, reason) => set((s) => ({
    requests: s.requests.map((r) =>
      r.id === id ? { ...r, status: "deferred" as const, deferReason: reason } : r
    ),
  })),

  grantComplimentary: (facilityId, targetTier, _expiryDate, _notes) => {
    // In the demo, just trigger a toast confirming the grant
    const facility = MOCK_TIER_REQUESTS.find((r) => r.facility.id === facilityId)?.facility;
    if (!facility) return;
    set({ lastApprovedAction: { facilityName: facility.name, toTier: targetTier } });
  },

  clearApprovedAction: () => set({ lastApprovedAction: null }),
}));
