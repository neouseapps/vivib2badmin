"use client";
import { ChevronLeft, Search, Bell, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export function Header({ title, actions }: { title: string; actions?: React.ReactNode }) {
  const router = useRouter();
  return (
    <header className="h-[60px] shrink-0 border-b border-line bg-bg-lv1 flex items-center gap-3 px-5">
      <button onClick={() => router.back()} className="p-1 -ml-1 rounded-md hover:bg-bg-lv3 text-ink-2">
        <ChevronLeft size={20}/>
      </button>
      <h1 className="text-h4 font-semibold text-ink-1">{title}</h1>
      <div className="ml-auto flex items-center gap-2">
        {actions}
      </div>
    </header>
  );
}

export function CreateTaskButton() {
  return (
    <button className="btn-primary h-9">
      <Plus size={16}/>Tạo công việc
    </button>
  );
}
