# VSVN · Lead Scoring & Grading Demo

Demo interactive cho phân hệ **Chấm điểm & Xếp hạng Lead** theo mô hình ma trận 2 trục:

- **Axis A — Ecosystem Value** (tự động từ API; Social Gravity + Wallet Share + Ecosystem Proximity)
- **Axis B — Partnership Viability** (Sales Rep nhập qua Ping Test)

## Chạy thử

```bash
pnpm install
pnpm dev
# http://localhost:3000
```

## Luồng chính

- `/leads` — Danh sách lead với Axis A/B, hạng, xu hướng 7 ngày.
- `/leads/[id]` — Chi tiết lead, Gauge A/B, ma trận mini, audit timeline.
  - Bấm **Ping Test** để chấm lại Axis B (4 câu radio, không lộ %).
  - Lead `onboarded` → toàn bộ score khoá + padlock.
  - Lead `COLD` → Axis B section khoá, yêu cầu cập nhật liên hệ.
  - Sau submit Ping Test → nếu lead nhảy hạng → toast nổi.
- `/settings/scoring`
  - Tab **Axis A**: Balance Slider (Hare-Niemeyer rebalance 100%), Rule Engine (If-Then), Resource Manager, Simulation, Code Mode.
  - Tab **Axis B**: Ping Test Builder + Achievement % (chỉ admin thấy).
  - Tab **Grading Matrix**: 4×4 heatmap, ngưỡng thay đổi trực quan.

## Stack

Next.js 15 · React 19 · TypeScript · Tailwind 3 · Zustand · Recharts · Framer Motion · lucide-react.

Tokens lấy từ file Figma `VSVN Admin & Operation Portal` (node 861:115486).
