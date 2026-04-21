"use client";
import { useState } from "react";
import {
  Building2, MapPin, Plus, Pencil, BadgeCheck, Star, X, Upload, Save, ChevronDown, Trash2,
} from "lucide-react";
import { cn } from "@/lib/cn";

// ─── Types & mock data ─────────────────────────────────────────────────────────

type ServiceType = "Lưu trú" | "Spa" | "Ẩm thực & Giải khát" | "Vui chơi" | "Hội nghị";

interface ServiceCard {
  id: string;
  type: ServiceType;
  name: string;
  active: boolean;
  isMain?: boolean;
}

interface BusinessLocation {
  id: string;
  name: string;
  address: string;
  ward: string;
  district: string;
  city: string;
  services: ServiceCard[];
}

const COMPANY = {
  name: "Công ty cổ phần Tập đoàn Mặt Trời",
  taxCode: "0305016195",
  address: "13 Hai Bà Trưng, TP. Hà Nội",
  verified: true,
};

const LEGAL_INFO = {
  legalName: "Công ty Cổ phần Tập đoàn Mặt Trời",
  foreignName: "Sun Group Corporation",
  shortName: "Sun Group",
  taxCode: "0305016195",
  legalRep: "Đặng Minh Trường",
  address: "Tầng 9, Toà nhà Sun City, 13 Hai Bà Trưng",
  ward: "Phường Tràng Tiền",
  district: "Quận Hoàn Kiếm",
  city: "Hà Nội",
};

const INITIAL_LOCATIONS: BusinessLocation[] = [
  {
    id: "loc-1",
    name: "Khách sạn Mercure Hội An",
    address: "35 Phạm Chu Trinh",
    ward: "Minh An",
    district: "Hội An",
    city: "Quảng Nam",
    services: [
      { id: "s1", type: "Lưu trú", name: "Khách sạn Mercure", active: true, isMain: true },
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
      { id: "s7", type: "Lưu trú", name: "Khách sạn Mercure", active: false, isMain: true },
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
      { id: "s8", type: "Lưu trú", name: "Alma Resort", active: true, isMain: true },
      { id: "s9", type: "Vui chơi", name: "Aqua Park", active: false },
      { id: "s10", type: "Ẩm thực & Giải khát", name: "Coconut Grove", active: false },
    ],
  },
];

// ─── Shared primitives ────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 min-h-[40px]">
      <span className="w-[172px] shrink-0 text-body font-medium text-ink-1">{label}</span>
      <span className="flex-1 text-body text-ink-1">{value}</span>
    </div>
  );
}

function SectionTitle({ children, note }: { children: string; note?: string }) {
  return (
    <div className="flex items-start gap-1">
      <Building2 size={20} className="text-ink-3 shrink-0 mt-0.5" />
      <div className="flex flex-col gap-0.5">
        <span className="text-body font-medium text-ink-1">{children}</span>
        {note && <span className="text-xs text-ink-2">{note}</span>}
      </div>
    </div>
  );
}

// ─── Legal Info Modal ─────────────────────────────────────────────────────────

function LegalInfoModal({ onClose }: { onClose: () => void }) {
  const [reason, setReason] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="w-[720px] max-h-[90vh] bg-bg-lv1 rounded-[20px] flex flex-col shadow-lv2">
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-5 bg-bg-lv2 rounded-t-[20px] shrink-0 border-b border-line">
          <span className="text-h3 font-semibold text-ink-1">Thông tin pháp lý</span>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-bg-lv3 transition-colors text-ink-2"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
          {/* Thông tin chung */}
          <div className="flex flex-col gap-4">
            <SectionTitle>Thông tin chung</SectionTitle>
            <div className="flex flex-col gap-4 pl-6">
              <InfoRow label="Tên pháp lý" value={LEGAL_INFO.legalName} />
              <InfoRow label="Tên tiếng nước ngoài" value={LEGAL_INFO.foreignName} />
              <InfoRow label="Tên viết tắt" value={LEGAL_INFO.shortName} />
              <InfoRow label="Mã số doanh nghiệp" value={LEGAL_INFO.taxCode} />
              <InfoRow label="Đại diện pháp luật" value={LEGAL_INFO.legalRep} />
            </div>
          </div>

          <hr className="border-line opacity-80" />

          {/* Thông tin địa chỉ */}
          <div className="flex flex-col gap-4">
            <SectionTitle>Thông tin địa chỉ</SectionTitle>
            <div className="flex flex-col gap-4 pl-6">
              <InfoRow label="Địa chỉ" value={LEGAL_INFO.address} />
              <InfoRow label="Phường/Xã" value={LEGAL_INFO.ward} />
              <InfoRow label="Quận/Huyện" value={LEGAL_INFO.district} />
              <InfoRow label="Thành phố/Tỉnh" value={LEGAL_INFO.city} />
            </div>
          </div>

          <hr className="border-line opacity-80" />

          {/* Thông tin giấy phép */}
          <div className="flex flex-col gap-4">
            <SectionTitle note="Để thay đổi thông tin pháp lý, vui lòng tải lên giấy phép kinh doanh mới ở định dạng JPG/JPEG/PNG/PDF/HEIC.">
              Thông tin giấy phép
            </SectionTitle>
            <div className="flex flex-col gap-3 pl-6">
              {/* Upload row */}
              <div className="flex items-start gap-2">
                <div className="w-[172px] shrink-0 flex flex-col gap-0.5 pt-1">
                  <span className="text-body font-medium text-ink-1">
                    Tải lên GPKD<span className="text-danger">*</span>
                  </span>
                  <span className="text-xs text-ink-2">Tối đa 5MB.</span>
                </div>
                <label className="flex items-center gap-1.5 h-10 px-3 rounded-xl border border-line bg-bg-lv1 hover:bg-bg-lv3 cursor-pointer text-body font-semibold text-ink-1 transition-colors">
                  <Upload size={16} />
                  Tải tệp
                  <input type="file" className="hidden" accept=".jpg,.jpeg,.png,.pdf,.heic" />
                </label>
              </div>

              {/* Reason row */}
              <div className="flex items-start gap-2">
                <span className="w-[172px] shrink-0 text-body font-medium text-ink-1 pt-2">Lí do thay đổi</span>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ví dụ: Do thay đổi thông tin trên giấy phép kinh doanh..."
                  rows={3}
                  className="flex-1 input resize-none text-body"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="h-[68px] px-5 border-t border-line flex items-center justify-end rounded-b-[20px] shrink-0">
          <button
            disabled
            className="h-10 px-4 rounded-xl text-body font-semibold bg-bg-lv3 text-ink-4 cursor-not-allowed"
          >
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Address Edit Modal ───────────────────────────────────────────────────────

interface AddressFields {
  address: string;
  ward: string;
  district: string;
  city: string;
}

function AddressEditModal({
  location,
  onClose,
  onSave,
}: {
  location: BusinessLocation;
  onClose: () => void;
  onSave: (fields: AddressFields) => void;
}) {
  const [fields, setFields] = useState<AddressFields>({
    address: location.address,
    ward: location.ward,
    district: location.district,
    city: location.city,
  });

  const set = (k: keyof AddressFields) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFields((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="w-[480px] bg-bg-lv1 rounded-[20px] flex flex-col shadow-lv2">
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-5 bg-bg-lv2 rounded-t-[20px] border-b border-line">
          <span className="text-h3 font-semibold text-ink-1">Chỉnh sửa địa chỉ</span>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-bg-lv3 transition-colors text-ink-2"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-4">
          {(
            [
              { key: "address", label: "Địa chỉ" },
              { key: "ward", label: "Phường/Xã" },
              { key: "district", label: "Quận/Huyện" },
              { key: "city", label: "Thành phố/Tỉnh" },
            ] as { key: keyof AddressFields; label: string }[]
          ).map(({ key, label }) => (
            <div key={key} className="flex flex-col gap-1.5">
              <label className="text-cap-md font-semibold text-ink-1">{label}</label>
              <input
                className="input h-9"
                value={fields[key]}
                onChange={set(key)}
              />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="h-[68px] px-5 border-t border-line flex items-center justify-end gap-2 rounded-b-[20px]">
          <button onClick={onClose} className="btn-outline h-10 px-4">
            Huỷ
          </button>
          <button
            onClick={() => onSave(fields)}
            className="btn-primary h-10 px-4"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Service card ─────────────────────────────────────────────────────────────


function StatusBadge({ active }: { active: boolean }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-lg text-[10px] font-medium",
      active ? "bg-green-50 text-green-700" : "bg-bg-lv3 text-ink-3"
    )}>
      <span className={cn("w-1.5 h-1.5 rounded-full", active ? "bg-green-500" : "bg-ink-4")} />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function ServiceCardItem({
  card,
  editing,
  onToggleMain,
  onToggleActive,
  onDelete,
}: {
  card: ServiceCard;
  editing?: boolean;
  onToggleMain?: () => void;
  onToggleActive?: () => void;
  onDelete?: () => void;
}) {
  return (
    <div className={cn(
      "relative flex flex-col gap-3 p-4 rounded-[14px] border overflow-hidden bg-bg-lv1",
      card.active && !card.isMain
        ? "border-line"
        : card.active && card.isMain
          ? "border-amber-300"
          : "border-line opacity-60"
    )}>
      {/* Header row */}
      <div className="flex items-center justify-between gap-2">
        <span className={cn(
          "text-xs font-medium",
          card.active ? (card.isMain ? "text-amber-700" : "text-ink-2") : "text-ink-4"
        )}>
          {card.type}
        </span>
        {editing ? (
          <select
            value={card.active ? "active" : "inactive"}
            onChange={(e) => { if ((e.target.value === "active") !== card.active) onToggleActive?.(); }}
            className={cn(
              "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-lg text-[10px] font-medium border-0 cursor-pointer appearance-none pr-3 bg-no-repeat",
              card.active
                ? "bg-green-50 text-green-700"
                : "bg-bg-lv3 text-ink-3"
            )}
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 24 24' fill='none' stroke='%23808080' stroke-width='2.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")", backgroundPosition: "right 2px center" }}
          >
            <option value="active">● Active</option>
            <option value="inactive">● Inactive</option>
          </select>
        ) : (
          <StatusBadge active={card.active} />
        )}
      </div>

      {/* Name */}
      <p className={cn(
        "text-xl font-semibold leading-tight line-clamp-2 min-h-[48px]",
        card.active ? (card.isMain ? "text-amber-900" : "text-ink-2") : "text-ink-4"
      )}>
        {card.name}
      </p>

      {/* Main service badge / edit controls */}
      {editing ? (
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleMain}
            className={cn(
              "inline-flex items-center gap-1 px-2 py-1.5 rounded-[10px] text-xs font-semibold transition-colors",
              card.isMain
                ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                : "bg-bg-lv3 text-ink-3 hover:bg-bg-lv2"
            )}
          >
            <Star size={12} />
            Dịch vụ chính
          </button>
          {!card.active && !card.isMain && (
            <button
              onClick={onDelete}
              className="ml-auto p-1.5 rounded-lg hover:bg-red-50 text-ink-4 hover:text-danger transition-colors"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      ) : (
        card.isMain && (
          <div className={cn(
            "inline-flex items-center gap-1 self-start px-2 py-1.5 rounded-[10px] text-xs font-semibold",
            card.active ? "bg-amber-50 text-amber-700" : "bg-bg-lv3 text-ink-3"
          )}>
            <Star size={12} />
            Dịch vụ chính
          </div>
        )
      )}

      {/* Decorative accent */}
      {card.active && card.isMain && !editing && (
        <div className="absolute bottom-0 right-0 w-[60px] h-[60px] rounded-tl-3xl bg-amber-100 opacity-40" />
      )}
    </div>
  );
}

// ─── Location group ───────────────────────────────────────────────────────────

function LocationGroup({
  location,
  editing,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onEditAddress,
  onUpdateServices,
}: {
  location: BusinessLocation;
  editing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onEditAddress: () => void;
  onUpdateServices: (services: ServiceCard[]) => void;
}) {
  const rows: ServiceCard[][] = [];
  for (let i = 0; i < location.services.length; i += 3) {
    rows.push(location.services.slice(i, i + 3));
  }

  const toggleActive = (id: string) =>
    onUpdateServices(
      location.services.map((s) => s.id === id ? { ...s, active: !s.active } : s)
    );

  const toggleMain = (id: string) =>
    onUpdateServices(
      location.services.map((s) => ({ ...s, isMain: s.id === id }))
    );

  const deleteService = (id: string) =>
    onUpdateServices(location.services.filter((s) => s.id !== id));

  return (
    <div className="border border-line rounded-xl overflow-hidden bg-bg-lv1">
      {/* Location header */}
      <div className="flex items-start justify-between gap-4 p-5 border-b border-line">
        <div className="flex flex-col gap-1.5 min-w-0">
          <p className="text-xl font-bold text-ink-2 leading-tight">{location.name}</p>
          <div className="flex items-center gap-1 text-body text-ink-3">
            <MapPin size={14} className="shrink-0" />
            <span>{[location.address, location.ward, location.district, location.city].filter(Boolean).join(", ")}</span>
            {editing && (
              <button
                onClick={onEditAddress}
                className="ml-1 p-0.5 rounded hover:bg-bg-lv3 text-ink-3 hover:text-ink-1 transition-colors"
              >
                <Pencil size={13} />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {editing ? (
            <>
              <button
                onClick={onCancelEdit}
                className="flex items-center gap-1.5 h-10 px-3 rounded-xl text-body font-semibold text-ink-2 border border-line bg-bg-lv1 hover:bg-bg-lv3 transition-colors"
              >
                <X size={15} />
                Huỷ
              </button>
              <button
                onClick={onSaveEdit}
                className="flex items-center gap-1.5 h-10 px-3 rounded-xl text-body font-semibold text-white bg-brand hover:bg-brand/90 transition-colors"
              >
                <Save size={15} />
                Lưu chỉnh sửa
              </button>
            </>
          ) : (
            <>
              <button className="flex items-center gap-1.5 h-10 px-3 rounded-xl text-body font-semibold text-ink-1 hover:bg-bg-lv3 transition-colors">
                <Plus size={16} />
                Thêm dịch vụ
              </button>
              <button
                onClick={onStartEdit}
                className="flex items-center gap-1.5 h-10 px-3 rounded-xl text-body font-semibold text-ink-2 bg-bg-lv3 hover:bg-bg-lv3/80 transition-colors"
              >
                <Pencil size={16} />
                Sửa chi tiết
              </button>
            </>
          )}
        </div>
      </div>

      {/* Service cards */}
      <div className="p-5 bg-bg-lv2 flex flex-col gap-4">
        {rows.map((row, ri) => (
          <div key={ri} className="grid grid-cols-3 gap-4">
            {row.map((card) => (
              <ServiceCardItem
                key={card.id}
                card={card}
                editing={editing}
                onToggleActive={() => toggleActive(card.id)}
                onToggleMain={() => toggleMain(card.id)}
                onDelete={() => deleteService(card.id)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BusinessProfilePage() {
  const [showLegal, setShowLegal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addressEditId, setAddressEditId] = useState<string | null>(null);
  const [locations, setLocations] = useState<BusinessLocation[]>(INITIAL_LOCATIONS);

  const updateServices = (locId: string, services: ServiceCard[]) =>
    setLocations((ls) => ls.map((l) => l.id === locId ? { ...l, services } : l));

  const saveAddress = (locId: string, fields: { address: string; ward: string; district: string; city: string }) =>
    setLocations((ls) => ls.map((l) => l.id === locId ? { ...l, ...fields } : l));

  const addressEditLocation = locations.find((l) => l.id === addressEditId) ?? null;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-10 py-10 flex flex-col gap-8 max-w-[1200px]">

        {/* Company header card */}
        <div className="border border-line rounded-xl p-6 bg-bg-lv1">
          <div className="flex items-start gap-4">
            <div className="w-[92px] h-[92px] rounded-[20px] border border-line bg-white flex items-center justify-center shrink-0">
              <Building2 size={40} className="text-ink-3" />
            </div>

            <div className="flex-1 min-w-0 flex flex-col justify-between gap-3">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-ink-2 leading-tight">{COMPANY.name}</h1>
                {COMPANY.verified && <BadgeCheck size={22} className="text-brand shrink-0" />}
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1 text-body text-ink-1">
                  <Building2 size={14} className="text-ink-3 shrink-0" />
                  <span>
                    <span className="text-ink-3">Mã số doanh nghiệp: </span>
                    {COMPANY.taxCode}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-body text-ink-1">
                  <MapPin size={14} className="text-ink-3 shrink-0" />
                  <span>
                    <span className="text-ink-3">Địa chỉ: </span>
                    {COMPANY.address}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowLegal(true)}
              className="flex items-center gap-1.5 h-10 px-3 rounded-xl text-body font-semibold text-ink-2 bg-bg-lv3 hover:bg-bg-lv3/80 transition-colors shrink-0"
            >
              Xem chi tiết
            </button>
          </div>
        </div>

        {/* Locations section */}
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center gap-1.5">
              <h2 className="text-xl font-semibold text-ink-2">Địa điểm kinh doanh</h2>
              <span className="text-xl font-semibold text-ink-3">({locations.length})</span>
            </div>
            <button className="flex items-center gap-1.5 h-10 px-3 rounded-xl text-body font-semibold text-white bg-brand hover:bg-brand/90 transition-colors">
              <Plus size={16} />
              Thêm dịch vụ
            </button>
          </div>

          {locations.map((loc) => (
            <LocationGroup
              key={loc.id}
              location={loc}
              editing={editingId === loc.id}
              onStartEdit={() => setEditingId(loc.id)}
              onCancelEdit={() => setEditingId(null)}
              onSaveEdit={() => setEditingId(null)}
              onEditAddress={() => setAddressEditId(loc.id)}
              onUpdateServices={(services) => updateServices(loc.id, services)}
            />
          ))}
        </div>
      </div>

      {/* Modals */}
      {showLegal && <LegalInfoModal onClose={() => setShowLegal(false)} />}
      {addressEditLocation && (
        <AddressEditModal
          location={addressEditLocation}
          onClose={() => setAddressEditId(null)}
          onSave={(fields) => {
            saveAddress(addressEditLocation.id, fields);
            setAddressEditId(null);
          }}
        />
      )}
    </div>
  );
}
