"use client";

import { useState } from "react";
import { MapPin, Plus, Pencil, Star, X, Save, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button, Select } from "@/components/ui";
import type {
  ServiceCard,
  BusinessLocation,
  AddressFields,
} from "@/lib/mock/businessLocations";

// ─── Status badge ─────────────────────────────────────────────────────────────

export function StatusBadge({ active }: { active: boolean }) {
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

// ─── Service card item ────────────────────────────────────────────────────────

export function ServiceCardItem({
  card,
  editing,
  onToggleMain,
  onToggleActive,
  onDelete,
  onCardClick,
}: {
  card: ServiceCard;
  editing?: boolean;
  onToggleMain?: () => void;
  onToggleActive?: () => void;
  onDelete?: () => void;
  /** When provided AND not editing, the entire card is clickable. */
  onCardClick?: () => void;
}) {
  const isClickable = !editing && !!onCardClick;
  const Tag = isClickable ? "button" : "div";

  return (
    <Tag
      type={isClickable ? "button" : undefined}
      onClick={isClickable ? onCardClick : undefined}
      className={cn(
        "relative flex flex-col gap-3 p-4 rounded-[14px] border overflow-hidden bg-bg-lv1 text-left w-full",
        card.active && !card.isMain
          ? "border-line"
          : card.active && card.isMain
            ? "border-amber-300"
            : "border-line opacity-60",
        isClickable && "cursor-pointer transition-all hover:shadow-sm hover:border-ink-3",
        isClickable && card.active && card.isMain && "hover:border-amber-400"
      )}
    >
      {/* Header row */}
      <div className="flex items-center justify-between gap-2">
        <span className={cn(
          "text-xs font-medium",
          card.active ? (card.isMain ? "text-amber-700" : "text-ink-2") : "text-ink-4"
        )}>
          {card.type}
        </span>
        {editing ? (
          <div onClick={(e) => e.stopPropagation()}>
            <Select
              size="sm"
              value={card.active ? "active" : "inactive"}
              onChange={(next) => { if ((next === "active") !== card.active) onToggleActive?.(); }}
              options={[
                { value: "active", label: "● Active" },
                { value: "inactive", label: "● Inactive" },
              ]}
            />
          </div>
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
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggleMain?.(); }}
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
              type="button"
              onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
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
        <div className="absolute bottom-0 right-0 w-[60px] h-[60px] rounded-tl-3xl bg-amber-100 opacity-40 pointer-events-none" />
      )}
    </Tag>
  );
}

// ─── Location group ───────────────────────────────────────────────────────────

export function LocationGroup({
  location,
  editing,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onEditAddress,
  onUpdateServices,
  onCardClick,
}: {
  location: BusinessLocation;
  editing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onEditAddress: () => void;
  onUpdateServices: (services: ServiceCard[]) => void;
  /** When provided, service cards become clickable when not editing. */
  onCardClick?: (card: ServiceCard) => void;
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
                onCardClick={onCardClick ? () => onCardClick(card) : undefined}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Address Edit Modal ───────────────────────────────────────────────────────

export function AddressEditModal({
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
          <Button onClick={onClose} variant="outline" className="h-10 px-4">
            Huỷ
          </Button>
          <Button
            onClick={() => onSave(fields)}
            variant="primary"
            className="h-10 px-4"
          >
            Lưu
          </Button>
        </div>
      </div>
    </div>
  );
}
