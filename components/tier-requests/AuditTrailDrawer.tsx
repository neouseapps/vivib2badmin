"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useTierRequests } from "@/lib/store/tier-requests-store";
import { GRACE_PERIOD_EVENTS, MOCK_GRANT_HISTORY, PARTNER_BENEFITS_EVENTS } from "@/lib/mock/tierRequests";
import type { TierAuditEntry } from "@/lib/tier-requests/types";
import { AuditContent } from "./AuditContent";

export function AuditTrailDrawer() {
  const facilityId    = useTierRequests((s) => s.auditDrawerFacilityId);
  const requests      = useTierRequests((s) => s.requests);
  const completedHist = useTierRequests((s) => s.completedAuditHistory);
  const grantHistory  = useTierRequests((s) => s.grantHistory);
  const close         = useTierRequests((s) => s.closeAuditDrawer);

  const activeReq    = facilityId ? requests.find((r) => r.facility.id === facilityId) : null;
  const facilityName = activeReq?.facility.name ?? facilityId ?? "";
  const partnerName  = activeReq?.facility.partner ?? "";

  const requestEntries: TierAuditEntry[] = [
    ...(activeReq?.auditHistory ?? []),
    ...(facilityId ? (completedHist[facilityId] ?? []) : []),
  ];
  const graceEvents   = facilityId ? (GRACE_PERIOD_EVENTS[facilityId] ?? []) : [];
  const grants        = facilityId ? [...MOCK_GRANT_HISTORY, ...grantHistory].filter((g) => g.facilityId === facilityId) : [];
  const benefitEvents = partnerName ? (PARTNER_BENEFITS_EVENTS[partnerName] ?? []) : [];

  return (
    <AnimatePresence>
      {facilityId && (
        <>
          <motion.div
            key="audit-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[65]"
            onClick={close}
          />
          <motion.div
            key="audit-drawer"
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
            className="fixed right-0 top-0 h-full w-[520px] bg-bg-lv1 shadow-lv2 flex flex-col z-[70]"
          >
            <div className="h-[60px] flex items-center justify-between px-5 bg-bg-lv2 border-b border-line shrink-0">
              <div>
                <span className="text-body font-semibold text-ink-1">Lịch sử phân hạng</span>
                {facilityName && <p className="text-cap text-ink-3 truncate max-w-[360px]">{facilityName}</p>}
              </div>
              <button onClick={close} className="w-8 h-8 flex items-center justify-center rounded-lg text-ink-3 hover:bg-bg-lv3 hover:text-ink-1 transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
              <AuditContent
                requestEntries={requestEntries}
                graceEvents={graceEvents}
                grants={grants}
                benefitEvents={benefitEvents}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
