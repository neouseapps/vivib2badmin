// Hare-Niemeyer Largest Remainder — đảm bảo tổng % chính xác bằng 100.
export function hareNiemeyer(weights: number[], total = 100): number[] {
  if (weights.length === 0) return [];
  const sum = weights.reduce((a, b) => a + b, 0);
  if (sum === 0) {
    const base = Math.floor(total / weights.length);
    const rem = total - base * weights.length;
    return weights.map((_, i) => base + (i < rem ? 1 : 0));
  }
  const raw = weights.map((w) => (w / sum) * total);
  const floors = raw.map(Math.floor);
  const usedTotal = floors.reduce((a, b) => a + b, 0);
  let remaining = total - usedTotal;
  const remainders = raw
    .map((r, i) => ({ i, frac: r - Math.floor(r) }))
    .sort((a, b) => b.frac - a.frac);
  const result = [...floors];
  for (let k = 0; k < remaining; k++) {
    result[remainders[k % remainders.length].i] += 1;
  }
  return result;
}

// Khi thêm 1 rule mới (mặc định 5%), 95% còn lại rebalance theo tỷ lệ gốc.
export function addRuleRebalance(existing: number[], newDefault = 5): number[] {
  const remaining = 100 - newDefault;
  const rescaled = hareNiemeyer(existing, remaining);
  return [...rescaled, newDefault];
}

export function removeRuleRebalance(existing: number[], indexToRemove: number): number[] {
  const kept = existing.filter((_, i) => i !== indexToRemove);
  return hareNiemeyer(kept, 100);
}

export function normalizeTo100(weights: number[]): number[] {
  return hareNiemeyer(weights, 100);
}

// REQ-BS-03: khi deactivate/xoá → weight chuyển sang neighbor trái (hoặc phải nếu idx=0)
export function removeToAdjacentRebalance(weights: number[], idx: number): number[] {
  if (weights.length <= 1) return [];
  const next = [...weights];
  const donated = next[idx];
  next.splice(idx, 1);
  const neighborIdx = idx === 0 ? 0 : idx - 1;
  next[neighborIdx] += donated;
  return hareNiemeyer(next, 100);
}

// Semantic wrapper: activate criterion at 5%, rebalance remaining 95%
export function activateCriterionRebalance(existing: number[]): number[] {
  return addRuleRebalance(existing, 5);
}
