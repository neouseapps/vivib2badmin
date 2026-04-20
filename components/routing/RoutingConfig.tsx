"use client";
import { Filter, Users2 } from "lucide-react";
import { useScoring } from "@/lib/store/scoring-store";

export function RoutingConfig() {
  const cfg = useScoring((s) => s.routingConfig);
  const setRoutingConfig = useScoring((s) => s.setRoutingConfig);

  return (
    <div className="space-y-4">
      {/* REQ-RG-01: Ngưỡng chất lượng */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-1">
          <Filter size={16} className="text-ink-3" />
          <h3 className="section-title">Ngưỡng chất lượng (Axis A)</h3>
          <span className="chip bg-info-light text-info ml-auto">REQ-RG-01</span>
        </div>
        <p className="text-cap-md text-ink-3 mb-4">
          Lead có điểm Axis A &ge; ngưỡng sẽ đủ điều kiện để Sales xem xét.
          Lead dưới ngưỡng tự động chuyển sang danh sách Marketing Nurture, bypass hoàn toàn đội Sales.
        </p>
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-1">
            <label className="label">Điểm Axis A tối thiểu</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={100}
                value={cfg.minScoreA}
                onChange={(e) =>
                  setRoutingConfig({ minScoreA: Math.min(100, Math.max(0, Number(e.target.value))) })
                }
                className="input w-24"
              />
              <span className="text-cap-md text-ink-3">/ 100</span>
            </div>
          </div>
          <div className="ml-4 flex-1 bg-bg-lv2 rounded-lg px-4 py-3 border border-line">
            <div className="text-cap-md text-ink-3 mb-1">Ngưỡng hiện tại</div>
            <div className="flex items-end gap-1">
              <span className="text-h3 font-bold text-ink-1">{cfg.minScoreA}</span>
              <span className="text-body text-ink-3 mb-0.5">điểm</span>
            </div>
          </div>
        </div>
      </div>

      {/* REQ-RG-02: Kiểm soát năng suất */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-1">
          <Users2 size={16} className="text-ink-3" />
          <h3 className="section-title">Kiểm soát năng suất</h3>
          <span className="chip bg-info-light text-info ml-auto">REQ-RG-02</span>
        </div>
        <p className="text-cap-md text-ink-3 mb-4">
          Giới hạn số lead mỗi Sales Rep có thể xử lý mỗi ngày.
          Hệ thống tự động ưu tiên lead có điểm Axis A cao nhất vào queue Pending Audit trong hạn mức.
        </p>
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-1">
            <label className="label">Số lead tối đa / Sales Rep / ngày</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                value={cfg.maxLeadsPerRepPerDay}
                onChange={(e) =>
                  setRoutingConfig({ maxLeadsPerRepPerDay: Math.max(1, Number(e.target.value)) })
                }
                className="input w-24"
              />
              <span className="text-cap-md text-ink-3">lead / rep / ngày</span>
            </div>
          </div>
          <div className="ml-4 flex-1 bg-bg-lv2 rounded-lg px-4 py-3 border border-line">
            <div className="text-cap-md text-ink-3 mb-1">Hạn mức hiện tại</div>
            <div className="flex items-end gap-1">
              <span className="text-h3 font-bold text-ink-1">{cfg.maxLeadsPerRepPerDay}</span>
              <span className="text-body text-ink-3 mb-0.5">lead/rep</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
