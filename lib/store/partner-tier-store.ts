import { create } from "zustand";
import { PARTNER_FACILITIES } from "@/lib/mock/partnerTier";

interface PartnerTierStore {
  selectedFacilityId: string;
  setSelectedFacilityId: (id: string) => void;
}

export const usePartnerTierStore = create<PartnerTierStore>()((set) => ({
  selectedFacilityId: PARTNER_FACILITIES[0]?.id ?? "",
  setSelectedFacilityId: (selectedFacilityId) => set({ selectedFacilityId }),
}));
