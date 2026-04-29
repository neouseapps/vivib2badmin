"use client";
import { create } from "zustand";
import type { TierLevel, TierRequest, TierAuditEntry, ComplianceSnapshot, GrantHistoryEntry } from "@/lib/tier-requests/types";
import { MOCK_TIER_REQUESTS, COMPLETED_AUDIT_HISTORY } from "@/lib/mock/tierRequests";
import { PARTNER_FACILITIES } from "@/lib/mock/partnerTier";
import { useComplimentaryGrants } from "./complimentary-grant-store";

interface State {
  requests: TierRequest[];
  selectedRequestId: string | null;
  /** facilityId of the facility whose audit drawer is open */
  auditDrawerFacilityId: string | null;
  lastApprovedAction: { facilityName: string; toTier: TierLevel } | null;
  /** Accumulated audit history for approved (removed) requests, keyed by facilityId */
  completedAuditHistory: Record<string, TierAuditEntry[]>;
  /** Grant history persisted from GrantModal */
  grantHistory: GrantHistoryEntry[];
}

interface Actions {
  selectRequest: (id: string | null) => void;
  openAuditDrawer: (facilityId: string) => void;
  closeAuditDrawer: () => void;
  approveRequest: (id: string, snapshot?: ComplianceSnapshot) => void;
  deferRequest: (id: string, reason: string, snapshot?: ComplianceSnapshot) => void;
  grantComplimentary: (facilityId: string, targetTier: TierLevel, expiryDate: string, notes: string) => void;
  clearApprovedAction: () => void;
}

export const useTierRequests = create<State & Actions>((set, get) => ({
  requests: MOCK_TIER_REQUESTS,
  selectedRequestId: null,
  auditDrawerFacilityId: null,
  lastApprovedAction: null,
  completedAuditHistory: COMPLETED_AUDIT_HISTORY,
  grantHistory: [],

  selectRequest: (id) => set({ selectedRequestId: id }),

  openAuditDrawer: (facilityId) => set({ auditDrawerFacilityId: facilityId }),

  closeAuditDrawer: () => set({ auditDrawerFacilityId: null }),

  approveRequest: (id, snapshot) => {
    const req = get().requests.find((r) => r.id === id);
    if (!req) return;

    const approveEntry: TierAuditEntry = {
      id: `approve-${id}-${Date.now()}`,
      at: new Date().toISOString(),
      actor: "Admin",
      action: `Phê duyệt — Nâng hạng Tier ${req.fromTier} → ${req.toTier}`,
      track: req.details.kind === "sync" ? "sync" : "organic",
      kind: "request",
      fromTier: req.fromTier,
      toTier: req.toTier,
      complianceSnapshot: snapshot,
    };

    const facilityId = req.facility.id;
    const existing = get().completedAuditHistory[facilityId] ?? [];

    set((s) => ({
      requests: s.requests.filter((r) => r.id !== id),
      selectedRequestId: null,
      lastApprovedAction: { facilityName: req.facility.name, toTier: req.toTier },
      completedAuditHistory: {
        ...s.completedAuditHistory,
        [facilityId]: [...existing, ...req.auditHistory, approveEntry],
      },
    }));
  },

  deferRequest: (id, reason, snapshot) => {
    const req = get().requests.find((r) => r.id === id);
    if (!req) return;

    const deferEntry: TierAuditEntry = {
      id: `defer-${id}-${Date.now()}`,
      at: new Date().toISOString(),
      actor: "Admin",
      action: `Trì hoãn — Yêu cầu Tier ${req.fromTier} → ${req.toTier}`,
      reason,
      track: req.details.kind === "sync" ? "sync" : "organic",
      kind: "request",
      fromTier: req.fromTier,
      complianceSnapshot: snapshot,
    };

    set((s) => ({
      requests: s.requests.map((r) =>
        r.id === id
          ? { ...r, status: "deferred" as const, deferReason: reason, auditHistory: [...r.auditHistory, deferEntry] }
          : r
      ),
    }));
  },

  grantComplimentary: (facilityId, targetTier, expiryDate, notes) => {
    // Find facility name — check active requests AND partner facilities
    const req = get().requests.find((r) => r.facility.id === facilityId);
    const partnerFac = PARTNER_FACILITIES.find((f) => f.id === facilityId);
    const facilityName = req?.facility.name ?? partnerFac?.name ?? facilityId;

    const now = new Date().toISOString();

    const entry: GrantHistoryEntry = {
      id: `grant-${facilityId}-${Date.now()}`,
      facilityId,
      facilityName,
      grantedBy: "Admin",
      grantedAt: now,
      targetTier,
      expiryAt: expiryDate,
      justification: notes,
      kind: "complimentary",
    };

    // Push to shared complimentary store so Partner Portal can read it
    useComplimentaryGrants.getState().addGrant({
      facilityId,
      facilityName,
      tier: targetTier,
      expiresAt: expiryDate,
      grantedAt: now,
      grantedBy: "Admin",
      justification: notes,
    });

    set((s) => ({
      grantHistory: [...s.grantHistory, entry],
      lastApprovedAction: { facilityName, toTier: targetTier },
    }));
  },

  clearApprovedAction: () => set({ lastApprovedAction: null }),
}));
