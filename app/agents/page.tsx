"use client";
import { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { MOCK_AGENTS } from "@/lib/mock/agents";
import { Agent } from "@/lib/scoring/types";
import { cn } from "@/lib/cn";

const PAGE_SIZE = 25;

const PERMISSION_STYLE: Record<string, string> = {
  Admin: "bg-info-light text-info",
  Editor: "bg-warn-light text-warn",
  Viewer: "bg-bg-lv3 text-ink-3",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(-2)
    .join("")
    .toUpperCase();
}

export default function AgentsPage() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Agent | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftPartner, setDraftPartner] = useState("");
  const [draftPhone, setDraftPhone] = useState("");

  const filtered = useMemo(
    () =>
      MOCK_AGENTS.filter((a) =>
        a.name.toLowerCase().includes(q.toLowerCase())
      ),
    [q]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page]
  );

  function openDrawer(agent: Agent) {
    setSelected(agent);
    setDraftName(agent.name);
    setDraftPartner(agent.partner);
    setDraftPhone(agent.phone);
  }

  function closeDrawer() {
    setSelected(null);
  }

  function handleSearch(v: string) {
    setQ(v);
    setPage(1);
  }

  const pageNumbers = Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1);

  return (
    <>
      <Header title="Quản lý đối tác" />

      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-h3 font-semibold text-ink-1">Danh sách tài khoản Agent</h3>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
            <input
              value={q}
              onChange={(e) => handleSearch(e.target.value)}
              className="input pl-9"
              placeholder="Tìm theo họ tên…"
            />
          </div>
        </div>

        <div className="card overflow-hidden">
          <table className="w-full text-body">
            <thead className="bg-bg-lv2 border-b border-line text-cap-md text-ink-3">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Họ tên</th>
                <th className="text-left px-4 py-3 font-medium">Đối tác</th>
                <th className="text-left px-4 py-3 font-medium">Email</th>
                <th className="text-left px-4 py-3 font-medium">Phân quyền</th>
                <th className="text-left px-4 py-3 font-medium">Nguồn tạo</th>
                <th className="text-left px-4 py-3 font-medium">Người tạo</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((agent) => (
                <tr
                  key={agent.id}
                  className="border-t border-line hover:bg-bg-lv2/50 cursor-pointer transition-colors"
                  onClick={() => openDrawer(agent)}
                >
                  <td className="px-4 py-3 font-semibold text-ink-1">{agent.name}</td>
                  <td className="px-4 py-3 text-ink-2">{agent.partner}</td>
                  <td className="px-4 py-3 text-ink-2">{agent.email}</td>
                  <td className="px-4 py-3">
                    <span className={cn("chip", PERMISSION_STYLE[agent.permission])}>
                      {agent.permission}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-2">{agent.source}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-info-light text-info flex items-center justify-center text-cap font-semibold shrink-0">
                        {initials(agent.createdBy)}
                      </div>
                      <span className="text-ink-2">{agent.createdBy}</span>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-ink-3">
                    Không tìm thấy agent nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-line bg-bg-lv1 text-cap-md text-ink-3">
            <span>Số hàng mỗi trang: {PAGE_SIZE}</span>
            <div className="flex items-center gap-1">
              <button
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-bg-lv3 disabled:opacity-40 disabled:cursor-not-allowed"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft size={16} />
              </button>
              {pageNumbers.map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={cn(
                    "w-8 h-8 flex items-center justify-center rounded-lg text-cap-md font-medium",
                    page === n ? "bg-ink-1 text-white" : "hover:bg-bg-lv3 text-ink-2"
                  )}
                >
                  {n}
                </button>
              ))}
              <button
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-bg-lv3 disabled:opacity-40 disabled:cursor-not-allowed"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Drawer */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/20 z-40"
              onClick={closeDrawer}
            />
            <motion.div
              key="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
              className="fixed right-0 top-0 h-full w-[640px] bg-bg-lv1 shadow-lv2 flex flex-col z-50"
            >
              {/* Drawer header */}
              <div className="h-[60px] flex items-center justify-between px-5 bg-bg-lv2 border-b border-line shrink-0">
                <span className="text-lg font-semibold text-ink-1">Chi tiết tài khoản</span>
                <button
                  onClick={closeDrawer}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-ink-3 hover:bg-bg-lv3 hover:text-ink-1 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Drawer body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin">
                {/* Họ tên */}
                <div className="flex items-start gap-4">
                  <span className="w-[172px] shrink-0 text-body text-ink-1 pt-2">
                    Họ tên <span className="text-brand">*</span>
                  </span>
                  <input
                    className="input flex-1"
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                  />
                </div>

                {/* Đối tác */}
                <div className="flex items-start gap-4">
                  <span className="w-[172px] shrink-0 text-body text-ink-1 pt-2">
                    Đối tác <span className="text-brand">*</span>
                  </span>
                  <input
                    className="input flex-1"
                    value={draftPartner}
                    onChange={(e) => setDraftPartner(e.target.value)}
                  />
                </div>

                {/* Email */}
                <div className="flex items-start gap-4">
                  <span className="w-[172px] shrink-0 text-body text-ink-1 pt-2">Email</span>
                  <input
                    className="input flex-1 bg-bg-lv2 text-ink-3 cursor-not-allowed"
                    value={selected.email}
                    disabled
                  />
                </div>

                {/* Số điện thoại */}
                <div className="flex items-start gap-4">
                  <span className="w-[172px] shrink-0 text-body text-ink-1 pt-2">
                    Số điện thoại <span className="text-brand">*</span>
                  </span>
                  <input
                    className="input flex-1"
                    value={draftPhone}
                    onChange={(e) => setDraftPhone(e.target.value)}
                  />
                </div>

                {/* Phân quyền */}
                <div className="flex items-start gap-4">
                  <span className="w-[172px] shrink-0 text-body text-ink-1 pt-2">Phân quyền</span>
                  <input
                    className="input flex-1 bg-bg-lv2 text-ink-3 cursor-not-allowed"
                    value={selected.permission}
                    disabled
                  />
                </div>

                {/* Nguồn tạo */}
                <div className="flex items-start gap-4">
                  <span className="w-[172px] shrink-0 text-body text-ink-1 pt-2">Nguồn tạo</span>
                  <input
                    className="input flex-1 bg-bg-lv2 text-ink-3 cursor-not-allowed"
                    value={selected.source}
                    disabled
                  />
                </div>

                {/* Ngày cập nhật */}
                <div className="flex items-start gap-4">
                  <span className="w-[172px] shrink-0 text-body text-ink-1 pt-2">Ngày cập nhật</span>
                  <input
                    className="input flex-1 bg-bg-lv2 text-ink-3 cursor-not-allowed"
                    value={selected.updatedAt}
                    disabled
                  />
                </div>

                {/* Người tạo */}
                <div className="flex items-start gap-4">
                  <span className="w-[172px] shrink-0 text-body text-ink-1 pt-2">Người tạo</span>
                  <div className="flex items-center gap-2 h-10">
                    <div className="w-6 h-6 rounded-full bg-info-light text-info flex items-center justify-center text-cap font-semibold shrink-0">
                      {initials(selected.createdBy)}
                    </div>
                    <span className="text-body text-ink-2">{selected.createdBy}</span>
                  </div>
                </div>

                {/* Ngày tạo */}
                <div className="flex items-start gap-4">
                  <span className="w-[172px] shrink-0 text-body text-ink-1 pt-2">Ngày tạo</span>
                  <input
                    className="input flex-1 bg-bg-lv2 text-ink-3 cursor-not-allowed"
                    value={selected.createdAt}
                    disabled
                  />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
