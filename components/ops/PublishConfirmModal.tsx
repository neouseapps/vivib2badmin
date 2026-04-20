"use client";
import { useState } from "react";
import { AlertTriangle, X, Zap } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (changeNote: string) => void;
  affectedLeadsCount: number;
  estimatedSeconds: number;
}

export function PublishConfirmModal({ open, onClose, onConfirm, affectedLeadsCount, estimatedSeconds }: Props) {
  const [changeNote, setChangeNote] = useState("");

  if (!open) return null;

  function handleConfirm() {
    if (!changeNote.trim()) return;
    onConfirm(changeNote.trim());
    setChangeNote("");
  }

  function handleClose() {
    setChangeNote("");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-[480px]">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-line">
          <div className="w-8 h-8 rounded-full bg-warn-light flex items-center justify-center shrink-0">
            <AlertTriangle size={16} className="text-warn-text" />
          </div>
          <div className="flex-1">
            <h2 className="text-body font-semibold text-ink-1">Xác nhận Publish & Tính lại</h2>
            <p className="text-cap text-ink-3">Hành động này sẽ ảnh hưởng đến toàn bộ hệ thống</p>
          </div>
          <button onClick={handleClose} className="text-ink-3 hover:text-ink-1 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div className="bg-warn-light rounded-lg p-4 space-y-1.5">
            <p className="text-cap-md text-ink-1">
              Bạn đang chuẩn bị áp dụng cấu hình mới. Hành động này sẽ kích hoạt tính toán lại cho{" "}
              <span className="font-semibold text-warn-text">{affectedLeadsCount.toLocaleString()}</span> Raw Leads hiện có.
            </p>
            <p className="text-cap text-ink-2">
              Thời gian dự kiến: ~<span className="font-semibold">{estimatedSeconds}</span> giây.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-cap-md font-semibold text-ink-1">
              Change Note <span className="text-danger">*</span>
            </label>
            <textarea
              value={changeNote}
              onChange={(e) => setChangeNote(e.target.value)}
              placeholder='Ví dụ: "Tăng trọng số Social Gravity, thêm tiêu chí Demand Velocity vào Ping Test"'
              rows={3}
              className="input w-full resize-none text-cap-md"
            />
            <p className="text-cap text-ink-3">Bắt buộc — dùng để quản lý lịch sử phiên bản.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-3 border-t border-line bg-bg-lv2/40 rounded-b-xl">
          <button onClick={handleClose} className="btn-outline">Huỷ</button>
          <button
            onClick={handleConfirm}
            disabled={!changeNote.trim()}
            className="btn-primary flex items-center gap-1.5 disabled:opacity-50"
          >
            <Zap size={14} />
            Xác nhận &amp; Áp dụng
          </button>
        </div>
      </div>
    </div>
  );
}
