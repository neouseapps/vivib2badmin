export type TierLevel = 0 | 1 | 2 | 3 | 4 | 5;
export type TierRequestKind = "upgrade" | "sync";
export type TierRequestStatus = "pending" | "deferred";
export type TierTrack = "organic" | "sync" | "complimentary";
export type Vertical = "Accommodation" | "F&B" | "Tour" | "Retail";

export interface FacilityRef {
  id: string;
  name: string;
  currentTier: TierLevel;
  vertical: Vertical;
  partner: string;
  location: string;
  dataScore: number;
  serviceScore: number;
}

export interface TierMetric {
  id: string;
  label: string;
  score: number;
  threshold: number;
  passed: boolean;
}

export type SystemChecklist = Record<string, TierMetric>;

export interface ComplianceItem {
  id: string;
  label: string;
}

export interface UpgradeRequest {
  kind: "upgrade";
  systemChecklist: SystemChecklist;
  complianceItems: ComplianceItem[];
}

export interface SyncRequest {
  kind: "sync";
  sourceFacility: FacilityRef;
  targetFacilities: FacilityRef[];
  justification: string;
  durationDays: 30 | 60 | 90;
}

// ── Audit entry — enriched ────────────────────────────────────────────────────

export type AuditEntryKind = "request" | "grace" | "grant" | "benefit";

export interface ComplianceSnapshot {
  systemPassed: number;
  systemTotal: number;
  manualChecked: number;
  manualTotal: number;
}

export interface TierAuditEntry {
  id: string;
  at: string;
  actor: string;
  action: string;
  reason?: string;
  track: TierTrack;
  // enriched — state transition
  fromTier?: TierLevel;
  toTier?: TierLevel;
  kind?: AuditEntryKind;
  complianceSnapshot?: ComplianceSnapshot;
  // enriched — grant-specific
  grantedTo?: string;
  expiryAt?: string;
  justification?: string;
}

// ── Grace period event ────────────────────────────────────────────────────────

export type GracePeriodEventType =
  | "tier_downgraded"
  | "grace_started"
  | "grace_ended"
  | "grace_expired";

export interface GracePeriodEvent {
  id: string;
  event_type: GracePeriodEventType;
  event_at: string;
  old_status: "active" | "grace_period" | null;
  new_status: "active" | "grace_period";
  old_period_tier: TierLevel;
  new_period_tier: TierLevel;
  reason: string;
}

// ── Grant history entry ───────────────────────────────────────────────────────

export type GrantKind = "complimentary" | "sync";

export interface GrantHistoryEntry {
  id: string;
  facilityId: string;
  facilityName: string;
  grantedBy: string;
  grantedAt: string;
  targetTier: TierLevel;
  expiryAt: string;
  justification: string;
  kind: GrantKind;
}

// ── Partner account benefits event ───────────────────────────────────────────

export type PartnerBenefitsEventType =
  | "PartnerAccountReachedTier3"
  | "PartnerAccountReachedTier4"
  | "PartnerAccountDroppedBelowTier3"
  | "PartnerAccountDroppedBelowTier4";

export interface PartnerBenefitsEvent {
  id: string;
  event_type: PartnerBenefitsEventType;
  event_at: string;
  highest_active_facility_tier: TierLevel;
  has_any_tier3: boolean;
  has_any_tier4: boolean;
  /** Facility name that triggered this change */
  trigger_facility: string;
  /** If AM grace period was started, this is its expiry */
  am_grace_expires_at?: string;
}

// ── Tier request ──────────────────────────────────────────────────────────────

export interface TierRequest {
  id: string;
  facility: FacilityRef;
  fromTier: TierLevel;
  toTier: TierLevel;
  status: TierRequestStatus;
  submittedAt: string;
  slaDeadlineAt: string;
  submittedBy: string;
  deferReason?: string;
  details: UpgradeRequest | SyncRequest;
  auditHistory: TierAuditEntry[];
}

export interface GrantComplimentaryDraft {
  facilityId: string | null;
  targetTier: TierLevel | null;
  expiryDate: string;
  notes: string;
}
