"use client";
import { create } from "zustand";
import type { TierLevel } from "@/lib/tier-requests/types";

export interface ActiveComplimentaryGrant {
  facilityId: string;
  facilityName: string;
  tier: TierLevel;
  expiresAt: string; // ISO
  grantedAt: string; // ISO
  grantedBy: string;
  justification: string;
}

interface State {
  /** keyed by facilityId */
  grants: Record<string, ActiveComplimentaryGrant>;
}

interface Actions {
  addGrant: (grant: ActiveComplimentaryGrant) => void;
  removeGrant: (facilityId: string) => void;
}

export const useComplimentaryGrants = create<State & Actions>((set) => ({
  grants: {},

  addGrant: (grant) =>
    set((s) => ({ grants: { ...s.grants, [grant.facilityId]: grant } })),

  removeGrant: (facilityId) =>
    set((s) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [facilityId]: _removed, ...rest } = s.grants;
      return { grants: rest };
    }),
}));
