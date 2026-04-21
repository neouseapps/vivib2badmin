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

export interface SystemChecklist {
  facilities: TierMetric;
  operations: TierMetric;
  gallery: TierMetric;
  skus: TierMetric;
}

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

export interface TierAuditEntry {
  id: string;
  at: string;
  actor: string;
  action: string;
  reason?: string;
  track: TierTrack;
}

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
