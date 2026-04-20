"use client";
import { History, Save, Zap } from "lucide-react";
import { cn } from "@/lib/cn";

interface Props {
  draftDirty: boolean;
  isReadOnly: boolean;
  onSaveDraft: () => void;
  onPublishClick: () => void;
  onOpenHistory: () => void;
}

export function OpsToolbar({ draftDirty, isReadOnly, onSaveDraft, onPublishClick, onOpenHistory }: Props) {
  return (
    <div className="flex items-center gap-2 ml-auto">
      <button
        onClick={onOpenHistory}
        disabled={isReadOnly}
        className="btn-ghost h-9 text-cap-md flex items-center gap-1.5 disabled:opacity-40"
      >
        <History size={14} />
        Lịch sử Phiên bản
      </button>
      <button
        onClick={onSaveDraft}
        disabled={isReadOnly || !draftDirty}
        className={cn(
          "btn-outline h-9 text-cap-md flex items-center gap-1.5 relative disabled:opacity-40"
        )}
      >
        <Save size={14} />
        Lưu Nháp
        {draftDirty && (
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-warn" />
        )}
      </button>
      <button
        onClick={onPublishClick}
        disabled={isReadOnly}
        className="btn-primary h-9 text-cap-md flex items-center gap-1.5 disabled:opacity-50"
      >
        <Zap size={14} />
        Publish &amp; Tính lại
      </button>
    </div>
  );
}
