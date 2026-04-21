import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type Portal = "admin" | "partner";

interface PortalStore {
  portal: Portal;
  setPortal: (p: Portal) => void;
}

export const usePortalStore = create<PortalStore>()(
  persist(
    (set) => ({
      portal: "admin",
      setPortal: (portal) => set({ portal }),
    }),
    {
      name: "vsvn-portal",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
