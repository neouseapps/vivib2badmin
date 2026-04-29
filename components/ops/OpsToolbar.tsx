"use client";
import { History, Save, Zap } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui";

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
      <Button
        variant="ghost"
        onClick={onOpenHistory}
        disabled={isReadOnly}
        className="h-9 text-cap-md"
      >
        <History size={14} />
        Lịch sử Phiên bản
      </Button>
      <Button
        variant="outline"
        onClick={onSaveDraft}
        disabled={isReadOnly || !draftDirty}
        className="h-9 text-cap-md relative"
      >
        <Save size={14} />
        Lưu Nháp
        {draftDirty && (
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-warn" />
        )}
      </Button>
      <Button
        variant="primary"
        onClick={onPublishClick}
        disabled={isReadOnly}
        className="h-9 text-cap-md"
      >
        <Zap size={14} />
        Publish &amp; Tính lại
      </Button>
    </div>
  );
}
