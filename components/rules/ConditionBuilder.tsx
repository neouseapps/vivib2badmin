"use client";
import type {
  ConditionItem,
  ConditionOperator,
  ConditionRow,
  ConditionSubGroup,
  LogicalConnector,
  ResourceNode,
} from "@/lib/scoring/types";
import { isSubGroup } from "@/lib/scoring/types";
import { LEAD_TREE } from "@/lib/mock/config";
import { cn } from "@/lib/cn";
import { GripVertical, Plus, Trash2, Layers } from "lucide-react";

interface Props {
  conditions: ConditionItem[];
  connector: LogicalConnector;
  onChange: (conditions: ConditionItem[], connector: LogicalConnector) => void;
}

// ── Field groups (same source/order as sidebar) ──────────────────────────────
function buildFieldGroups(nodes: ResourceNode[]) {
  const groups: { group: string; items: { key: string; label: string; type: string }[] }[] = [];
  function collectLeaves(node: ResourceNode, items: { key: string; label: string; type: string }[]) {
    if (node.type !== "dictionary" && node.type !== "array") {
      items.push({ key: node.key, label: node.label, type: node.type });
    }
    node.children?.forEach((c) => collectLeaves(c, items));
  }
  for (const top of nodes) {
    const hasDictChild = top.children?.some((c) => c.type === "dictionary" || c.type === "array");
    if (hasDictChild) {
      for (const child of top.children ?? []) {
        if (child.type === "dictionary" || child.type === "array") {
          const items: { key: string; label: string; type: string }[] = [];
          child.children?.forEach((l) => collectLeaves(l, items));
          if (items.length) groups.push({ group: `${top.label} · ${child.label}`, items });
        } else {
          const ex = groups.find((g) => g.group === top.label);
          const item = { key: child.key, label: child.label, type: child.type };
          if (ex) ex.items.push(item); else groups.push({ group: top.label, items: [item] });
        }
      }
    } else {
      const items: { key: string; label: string; type: string }[] = [];
      top.children?.forEach((l) => collectLeaves(l, items));
      if (items.length) groups.push({ group: top.label, items });
    }
  }
  groups.push({ group: "custom", items: [{ key: "custom.campaign", label: "campaign", type: "string" }] });
  return groups;
}

const FIELD_GROUPS = buildFieldGroups(LEAD_TREE);
const FLAT_FIELDS = FIELD_GROUPS.flatMap((g) => g.items);

function getOperators(type: string): { value: ConditionOperator; label: string }[] {
  if (type === "boolean") return [
    { value: "exists", label: "ada" }, { value: "not_exists", label: "không tồn tại" },
    { value: "equals", label: "= true" }, { value: "not_equals", label: "= false" },
  ];
  if (type === "number") return [
    { value: "equals", label: "=" }, { value: "not_equals", label: "≠" },
    { value: "gt", label: ">" }, { value: "gte", label: "≥" },
    { value: "lt", label: "<" }, { value: "lte", label: "≤" },
    { value: "exists", label: "tồn tại" }, { value: "not_exists", label: "không tồn tại" },
  ];
  if (type === "enum") return [
    { value: "equals", label: "=" }, { value: "not_equals", label: "≠" },
    { value: "is_in_list", label: "thuộc" }, { value: "not_in_list", label: "không thuộc" },
  ];
  return [
    { value: "equals", label: "=" }, { value: "not_equals", label: "≠" },
    { value: "contains", label: "chứa" }, { value: "not_contains", label: "không chứa" },
    { value: "is_in_list", label: "thuộc" }, { value: "not_in_list", label: "không thuộc" },
    { value: "exists", label: "tồn tại" }, { value: "not_exists", label: "không tồn tại" },
  ];
}
const noValue = (op: ConditionOperator) => op === "exists" || op === "not_exists";

// ── Grouping logic ────────────────────────────────────────────────────────────
// New card starts when: first item, OR item has OR/XOR connector, OR item is a SubGroup
interface CardGroup {
  entryConnector?: LogicalConnector; // how this card connects to the previous (OR/XOR)
  items: ConditionItem[];
}

function groupConditions(items: ConditionItem[]): CardGroup[] {
  if (!items.length) return [];
  const cards: CardGroup[] = [];
  let cur: CardGroup = { entryConnector: undefined, items: [] };

  for (const item of items) {
    const conn = item.connector;
    const isGroup = isSubGroup(item);
    const prevIsGroup = cur.items.length > 0 && isSubGroup(cur.items[cur.items.length - 1]);
    const startsNewCard = isGroup || prevIsGroup || (conn && conn !== "AND");

    if (startsNewCard && cur.items.length > 0) {
      cards.push(cur);
      cur = { entryConnector: conn ?? "OR", items: [item] };
    } else {
      cur.items.push(item);
    }
  }
  if (cur.items.length > 0) cards.push(cur);
  return cards;
}

function flatIndexOf(cards: CardGroup[], cardIdx: number, itemIdx: number): number {
  let i = 0;
  for (let c = 0; c < cardIdx; c++) i += cards[c].items.length;
  return i + itemIdx;
}

// ── Connector pill between cards ──────────────────────────────────────────────
function CardConnectorPill({ value, onChange }: { value: LogicalConnector; onChange: (v: LogicalConnector) => void }) {
  return (
    <div className="flex items-center gap-2 py-0.5 px-0.5">
      <div className="h-px flex-1 bg-line" />
      <div className="inline-flex rounded-lg border border-line overflow-hidden text-cap font-bold">
        <button
          onClick={() => onChange("OR")}
          className={cn(
            "px-3 h-6 transition-colors",
            value === "OR" ? "bg-info text-white" : "bg-white text-ink-4 hover:text-info hover:bg-info-light"
          )}
        >OR</button>
        <div className="w-px bg-line" />
        <button
          onClick={() => onChange("XOR")}
          className={cn(
            "px-3 h-6 transition-colors",
            value === "XOR" ? "bg-warn-text text-white" : "bg-white text-ink-4 hover:text-warn-text hover:bg-warn-light"
          )}
        >NOR</button>
      </div>
      <div className="h-px flex-1 bg-line" />
    </div>
  );
}

// ── Row inside a card ─────────────────────────────────────────────────────────
function ConditionRowItem({
  row,
  onUpdate,
  onDelete,
}: {
  row: ConditionRow;
  onUpdate: (patch: Partial<ConditionRow>) => void;
  onDelete: () => void;
}) {
  const fieldMeta = FLAT_FIELDS.find((f) => f.key === row.field);
  const fieldType = fieldMeta?.type ?? "string";
  const operators = getOperators(fieldType);

  return (
    <div className="flex items-center gap-2 px-3 py-2.5 group hover:bg-bg-lv2/40 transition-colors">
      <GripVertical size={13} className="text-ink-4 cursor-grab shrink-0 opacity-50 group-hover:opacity-100" />

      <button
        onClick={() => onUpdate({ negate: !row.negate })}
        className={cn(
          "shrink-0 h-6 px-2 rounded-full text-cap font-bold border transition-colors",
          row.negate
            ? "bg-warn-light border-warn/40 text-warn-text"
            : "bg-bg-lv3 border-line text-ink-4 hover:text-ink-2 hover:border-ink-3"
        )}
      >
        NOT
      </button>

      <select
        value={row.field}
        onChange={(e) => {
          const meta = FLAT_FIELDS.find((f) => f.key === e.target.value);
          const ops = getOperators(meta?.type ?? "string");
          onUpdate({ field: e.target.value, operator: ops[0].value, value: "" });
        }}
        className="flex-1 min-w-0 text-cap-md h-8 rounded-lg border border-line bg-white px-2 focus:outline-none focus:ring-2 focus:ring-info/40"
      >
        {FIELD_GROUPS.map((g) => (
          <optgroup key={g.group} label={g.group}>
            {g.items.map((it) => <option key={it.key} value={it.key}>{it.label}</option>)}
          </optgroup>
        ))}
      </select>

      <select
        value={row.operator}
        onChange={(e) => onUpdate({ operator: e.target.value as ConditionOperator })}
        className="w-28 shrink-0 text-cap-md h-8 rounded-lg border border-line bg-white px-2 focus:outline-none focus:ring-2 focus:ring-info/40"
      >
        {operators.map((op) => <option key={op.value} value={op.value}>{op.label}</option>)}
      </select>

      {!noValue(row.operator) && (
        <input
          value={row.value}
          onChange={(e) => onUpdate({ value: e.target.value })}
          placeholder={row.operator === "is_in_list" || row.operator === "not_in_list" ? "val1,val2" : "Giá trị…"}
          className="w-24 shrink-0 text-cap-md h-8 rounded-lg border border-line bg-white px-2 focus:outline-none focus:ring-2 focus:ring-info/40"
        />
      )}

      <button
        onClick={onDelete}
        className="p-1.5 rounded-lg hover:bg-danger-light text-ink-4 hover:text-danger shrink-0 transition-colors opacity-0 group-hover:opacity-100"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}

// ── AND card ──────────────────────────────────────────────────────────────────
function AndCard({
  items,
  onUpdateItem,
  onDeleteItem,
  onAddCondition,
}: {
  items: ConditionRow[];
  onUpdateItem: (i: number, patch: Partial<ConditionRow>) => void;
  onDeleteItem: (i: number) => void;
  onAddCondition: () => void;
}) {
  return (
    <div className="rounded-xl border border-line bg-white overflow-hidden shadow-sm">
      {items.map((row, i) => (
        <div key={row.id}>
          {i > 0 && (
            <div className="flex items-center gap-2 py-0.5 px-0.5 border-t border-line bg-bg-lv2/20">
              <div className="h-px flex-1 bg-line" />
              <span className="inline-flex rounded-lg border border-line overflow-hidden text-cap font-bold bg-white px-3 h-6 items-center text-ink-3">
                &amp;
              </span>
              <div className="h-px flex-1 bg-line" />
            </div>
          )}
          <ConditionRowItem
            row={row}
            onUpdate={(patch) => onUpdateItem(i, patch)}
            onDelete={() => onDeleteItem(i)}
          />
        </div>
      ))}
      <div className="border-t border-line px-3 py-2 bg-bg-lv2/20">
        <button
          onClick={onAddCondition}
          className="flex items-center gap-1.5 text-cap-md text-ink-3 hover:text-ink-1 transition-colors"
        >
          <Plus size={12} />
          Add condition
        </button>
      </div>
    </div>
  );
}

// ── Sub-group card ────────────────────────────────────────────────────────────
function SubGroupCard({
  group,
  onUpdate,
  onDelete,
}: {
  group: ConditionSubGroup;
  onUpdate: (patch: Partial<ConditionSubGroup>) => void;
  onDelete: () => void;
}) {
  function updateRow(i: number, patch: Partial<ConditionRow>) {
    onUpdate({ rows: group.rows.map((r, idx) => idx === i ? { ...r, ...patch } : r) });
  }
  function deleteRow(i: number) {
    onUpdate({ rows: group.rows.filter((_, idx) => idx !== i) });
  }
  function addRow() {
    onUpdate({
      rows: [...group.rows, { id: `c-${Date.now()}`, connector: "AND", negate: false, field: FLAT_FIELDS[0].key, operator: "gte", value: "" }],
    });
  }

  return (
    <div className="rounded-xl border border-dashed border-ink-3/40 bg-bg-lv2/30 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-dashed border-ink-3/20">
        <Layers size={12} className="text-ink-4" />
        <span className="text-cap font-semibold text-ink-3 uppercase tracking-wider flex-1">Inner Group</span>
        <button onClick={onDelete} className="p-1 rounded hover:bg-danger-light text-ink-4 hover:text-danger">
          <Trash2 size={12} />
        </button>
      </div>
      {group.rows.map((row, i) => (
        <div key={row.id}>
          {i > 0 && (
            <div className="flex items-center justify-center px-4 py-0.5 border-t border-dashed border-ink-3/20 bg-bg-lv2/30">
              <span className="text-body-sm font-bold text-ink-4">&amp;</span>
            </div>
          )}
          <ConditionRowItem row={row} onUpdate={(p) => updateRow(i, p)} onDelete={() => deleteRow(i)} />
        </div>
      ))}
      <div className="border-t border-dashed border-ink-3/20 px-3 py-2">
        <button onClick={addRow} className="flex items-center gap-1.5 text-cap-md text-ink-3 hover:text-ink-1">
          <Plus size={12} />Add condition
        </button>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export function ConditionBuilder({ conditions, connector, onChange }: Props) {
  const cards = groupConditions(conditions);

  function emit(next: ConditionItem[]) {
    onChange(next, connector);
  }

  function updateItem(flatIdx: number, patch: Partial<ConditionItem>) {
    emit(conditions.map((c, i) => i === flatIdx ? { ...c, ...patch } : c));
  }

  function deleteItem(flatIdx: number) {
    const next = conditions.filter((_, i) => i !== flatIdx);
    // If we deleted the card-entry item (first item of non-first card), update next item's connector
    if (flatIdx < next.length && conditions[flatIdx].connector && conditions[flatIdx].connector !== "AND") {
      // next[flatIdx] was behind the deleted item and should now inherit the entry connector
      next[flatIdx] = { ...next[flatIdx], connector: conditions[flatIdx].connector };
    }
    emit(next);
  }

  function addConditionToCard(cardIdx: number) {
    const card = cards[cardIdx];
    const flatEnd = flatIndexOf(cards, cardIdx, card.items.length - 1);
    const newRow: ConditionRow = {
      id: `c-${Date.now()}`,
      connector: card.items.length > 0 ? "AND" : undefined,
      negate: false,
      field: FLAT_FIELDS[0].key,
      operator: "gte",
      value: "",
    };
    const next = [...conditions];
    next.splice(flatEnd + 1, 0, newRow);
    emit(next);
  }

  function addOrCard(conn: "OR" | "XOR") {
    const newRow: ConditionRow = {
      id: `c-${Date.now()}`,
      connector: conn,
      negate: false,
      field: FLAT_FIELDS[0].key,
      operator: "gte",
      value: "",
    };
    emit([...conditions, newRow]);
  }

  function addInnerGroup() {
    const newGroup: ConditionSubGroup = {
      id: `g-${Date.now()}`,
      connector: conditions.length > 0 ? "OR" : undefined,
      rows: [{ id: `c-${Date.now()}`, negate: false, field: FLAT_FIELDS[0].key, operator: "gte", value: "" }],
    };
    emit([...conditions, newGroup]);
  }

  function addFirstRow() {
    emit([{ id: `c-${Date.now()}`, negate: false, field: FLAT_FIELDS[0].key, operator: "gte", value: "" }]);
  }

  function updateCardEntryConnector(cardIdx: number, newConn: LogicalConnector) {
    const flatIdx = flatIndexOf(cards, cardIdx, 0);
    updateItem(flatIdx, { connector: newConn });
  }

  return (
    <div className="space-y-0.5">
      {conditions.length === 0 ? (
        <div
          onClick={addFirstRow}
          className="text-center py-4 text-cap text-ink-4 border border-dashed border-line rounded-xl bg-bg-lv2/40 cursor-pointer hover:bg-bg-lv3 transition-colors"
        >
          + Thêm điều kiện đầu tiên
        </div>
      ) : (
        <>
          {cards.map((card, cardIdx) => {
            const firstFlatIdx = flatIndexOf(cards, cardIdx, 0);
            const isSingleSubGroup = card.items.length === 1 && isSubGroup(card.items[0]);

            return (
              <div key={cardIdx} className="space-y-0.5">
                {/* Inter-card connector */}
                {cardIdx > 0 && card.entryConnector && (
                  <CardConnectorPill
                    value={card.entryConnector}
                    onChange={(c) => updateCardEntryConnector(cardIdx, c)}
                  />
                )}

                {isSingleSubGroup ? (
                  <SubGroupCard
                    group={card.items[0] as ConditionSubGroup}
                    onUpdate={(patch) => updateItem(firstFlatIdx, patch as Partial<ConditionItem>)}
                    onDelete={() => deleteItem(firstFlatIdx)}
                  />
                ) : (
                  <AndCard
                    items={card.items as ConditionRow[]}
                    onUpdateItem={(i, patch) => updateItem(firstFlatIdx + i, patch as Partial<ConditionItem>)}
                    onDeleteItem={(i) => deleteItem(firstFlatIdx + i)}
                    onAddCondition={() => addConditionToCard(cardIdx)}
                  />
                )}
              </div>
            );
          })}
        </>
      )}

      {/* Footer */}
      {conditions.length > 0 && (
        <div className="flex items-center gap-2 pt-1.5">
          <span className="text-cap text-ink-4">+ Thêm trigger:</span>
          <div className="inline-flex rounded-lg border border-line overflow-hidden">
            <button
              onClick={() => addOrCard("OR")}
              className="flex items-center gap-1 text-cap font-bold text-info bg-white hover:bg-info-light px-3 h-7 transition-colors"
            >
              <Plus size={11} />OR
            </button>
            <div className="w-px bg-line" />
            <button
              onClick={() => addOrCard("XOR")}
              className="flex items-center gap-1 text-cap font-bold text-warn-text bg-white hover:bg-warn-light px-3 h-7 transition-colors"
            >
              <Plus size={11} />NOR
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
