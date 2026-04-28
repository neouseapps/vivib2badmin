"use client";
import { useState } from "react";
import {
  Building2, MapPin, Plus, BadgeCheck, X, Upload,
} from "lucide-react";
import { cn } from "@/lib/cn";
import {
  INITIAL_LOCATIONS,
  type BusinessLocation,
  type ServiceCard,
  type AddressFields,
} from "@/lib/mock/businessLocations";
import { LocationGroup, AddressEditModal } from "@/components/partner/LocationGroup";

// ─── Mock data (page-local) ────────────────────────────────────────────────────

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
