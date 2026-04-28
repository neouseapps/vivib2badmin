// ─── Types ────────────────────────────────────────────────────────────────────

export type ServiceType = "Lưu trú" | "Spa" | "Ẩm thực & Giải khát" | "Vui chơi" | "Hội nghị";

export interface ServiceCard {
  id: string;
  type: ServiceType;
  name: string;
  active: boolean;
  isMain?: boolean;
  /** Optional link to a partner-tier facility (used by services-v2 drawer). */
  facilityId?: string;
}

export interface BusinessLocation {
  id: string;
  name: string;
  address: string;
  ward: string;
  district: string;
  city: string;
  services: ServiceCard[];
}

export interface AddressFields {
  address: string;
  ward: string;
  district: string;
  city: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

export const INITIAL_LOCATIONS: BusinessLocation[] = [
  {
    id: "loc-1",
    name: "Khách sạn Mercure Hội An",
    address: "35 Phạm Chu Trinh",
    ward: "Minh An",
    district: "Hội An",
    city: "Quảng Nam",
    services: [
      { id: "s1", type: "Lưu trú", name: "Khách sạn Mercure", active: true, isMain: true, facilityId: "pf-002" },
      { id: "s2", type: "Spa", name: "Rhône Spa", active: true },
      { id: "s3", type: "Ẩm thực & Giải khát", name: "La Crique", active: true },
      { id: "s4", type: "Lưu trú", name: "Khách sạn Mercure", active: false },
      { id: "s5", type: "Lưu trú", name: "Khách sạn Mercure", active: false },
      { id: "s6", type: "Lưu trú", name: "Khách sạn Mercure", active: false },
    ],
  },
  {
    id: "loc-2",
    name: "Khách sạn Mercure Đà Nẵng",
    address: "36 Bạch Đằng",
    ward: "Hải Châu",
    district: "Hải Châu",
    city: "Đà Nẵng",
    services: [
      { id: "s7", type: "Lưu trú", name: "Khách sạn Mercure", active: false, isMain: true, facilityId: "pf-001" },
    ],
  },
  {
    id: "loc-3",
    name: "Khu nghỉ dưỡng Alma",
    address: "Bãi Dài",
    ward: "Cam Lâm",
    district: "Cam Ranh",
    city: "Khánh Hòa",
    services: [
      { id: "s8",  type: "Lưu trú",                name: "Alma Resort",      active: true,  isMain: true, facilityId: "pf-003" },
      { id: "s9",  type: "Vui chơi",               name: "Aqua Park",        active: false },
      { id: "s10", type: "Ẩm thực & Giải khát",    name: "Coconut Grove",    active: false },
    ],
  },
  {
    id: "loc-4",
    name: "Mặt Trời Heritage Tours",
    address: "12 Nguyễn Thị Minh Khai",
    ward: "Minh An",
    district: "Hội An",
    city: "Quảng Nam",
    services: [
      { id: "s11", type: "Vui chơi",               name: "Heritage Tours",   active: true,  isMain: true, facilityId: "pf-004" },
      { id: "s12", type: "Ẩm thực & Giải khát",    name: "Phố Cổ Café",      active: true },
    ],
  },
  {
    id: "loc-5",
    name: "Mặt Trời City Hotel Hà Nội",
    address: "5 Đinh Tiên Hoàng",
    ward: "Hàng Trống",
    district: "Hoàn Kiếm",
    city: "Hà Nội",
    services: [
      { id: "s13", type: "Lưu trú",                name: "City Hotel",       active: true,  isMain: true, facilityId: "pf-007" },
      { id: "s14", type: "Ẩm thực & Giải khát",    name: "Sky Lounge",       active: true },
      { id: "s15", type: "Hội nghị",               name: "Conference Suite", active: false },
    ],
  },
  {
    id: "loc-6",
    name: "Mặt Trời Eco Resort Phú Quốc",
    address: "Bãi Dài, Gành Dầu",
    ward: "Gành Dầu",
    district: "Phú Quốc",
    city: "Kiên Giang",
    services: [
      { id: "s16", type: "Lưu trú",                name: "Eco Resort",       active: true,  isMain: true, facilityId: "pf-008" },
      { id: "s17", type: "Spa",                    name: "Jungle Spa",       active: true },
      { id: "s18", type: "Ẩm thực & Giải khát",    name: "Beachside Grill",  active: true },
      { id: "s19", type: "Vui chơi",               name: "Water Sports",     active: false },
    ],
  },
];

/**
 * Fallback map: services without their own `facilityId` use their location's
 * main facility for the v2 drawer. Allows clicking any sub-service (Spa,
 * Restaurant, …) in services-v2 to surface the parent property's tier info.
 */
export const LOCATION_MAIN_FACILITY: Record<string, string> = {
  "loc-1": "pf-002",
  "loc-2": "pf-001",
  "loc-3": "pf-003",
  "loc-4": "pf-004",
  "loc-5": "pf-007",
  "loc-6": "pf-008",
};

/** Reverse of LOCATION_MAIN_FACILITY: facilityId → locationId */
export const FACILITY_LOCATION_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(LOCATION_MAIN_FACILITY).map(([locId, facId]) => [facId, locId])
);

/** Returns the full address string for a facility, matching LocationGroup format. */
export function getFacilityFullAddress(facilityId: string, fallback: string): string {
  const locId = FACILITY_LOCATION_MAP[facilityId];
  const loc = INITIAL_LOCATIONS.find((l) => l.id === locId);
  if (!loc) return fallback;
  return [loc.address, loc.ward, loc.district, loc.city].filter(Boolean).join(", ");
}
