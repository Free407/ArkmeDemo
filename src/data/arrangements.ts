export type ArrangementStatus = "open" | "completed" | "later";

export type ArrangementContext = {
  id: string;
  text: string;
  senderName: string;
  conversationLabel: string;
  sentAt: number;
  source: string;
};

export type ArrangementItem = {
  id: string;
  title: string;
  scheduledAt: number | null;
  location: string;
  relatedPeople: string[];
  source: string;
  status: ArrangementStatus;
  createdAt: number;
  updatedAt: number;
  contexts: ArrangementContext[];
};

export type ArrangementRuleResult =
  | { action: "created"; arrangement: ArrangementItem }
  | { action: "merged"; arrangement: ArrangementItem }
  | { action: "none" };

export const arrangementsStorageKey = "arkme-demo.arrangements";
export const arrangementsStorageEvent = "arkme-demo:arrangements-updated";

function readJsonValue(key: string): unknown {
  if (typeof window === "undefined") return null;

  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

function writeJsonValue(key: string, value: unknown) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Keep the in-memory UI usable when localStorage is unavailable.
  }
}

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeTimestamp(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalizeContext(value: unknown, index: number): ArrangementContext | null {
  if (!value || typeof value !== "object") return null;

  const context = value as Partial<ArrangementContext>;
  const text = normalizeText(context.text);
  if (!text) return null;

  return {
    id: normalizeText(context.id) || `context-${index}`,
    text,
    senderName: normalizeText(context.senderName) || "未知来源",
    conversationLabel: normalizeText(context.conversationLabel) || "本地记录",
    sentAt: normalizeTimestamp(context.sentAt, Date.now() + index),
    source: normalizeText(context.source) || "手动",
  };
}

function normalizeArrangement(value: unknown, index: number): ArrangementItem | null {
  if (!value || typeof value !== "object") return null;

  const arrangement = value as Partial<ArrangementItem>;
  const title = normalizeText(arrangement.title);
  if (!title) return null;

  const status: ArrangementStatus =
    arrangement.status === "completed" || arrangement.status === "later"
      ? arrangement.status
      : "open";
  const contexts = Array.isArray(arrangement.contexts)
    ? arrangement.contexts
        .map(normalizeContext)
        .filter((context): context is ArrangementContext => Boolean(context))
    : [];

  return {
    id: normalizeText(arrangement.id) || `arrangement-${index}`,
    title,
    scheduledAt:
      typeof arrangement.scheduledAt === "number" && Number.isFinite(arrangement.scheduledAt)
        ? arrangement.scheduledAt
        : null,
    location: normalizeText(arrangement.location),
    relatedPeople: Array.isArray(arrangement.relatedPeople)
      ? arrangement.relatedPeople.map(normalizeText).filter(Boolean)
      : [],
    source: normalizeText(arrangement.source) || "手动创建",
    status,
    createdAt: normalizeTimestamp(arrangement.createdAt, Date.now() + index),
    updatedAt: normalizeTimestamp(arrangement.updatedAt, Date.now() + index),
    contexts,
  };
}

export function notifyArrangementChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(arrangementsStorageEvent));
}

export function getInitialArrangements() {
  const parsedValue = readJsonValue(arrangementsStorageKey);
  if (!Array.isArray(parsedValue)) return [];

  return parsedValue
    .map(normalizeArrangement)
    .filter((arrangement): arrangement is ArrangementItem => Boolean(arrangement));
}

export function persistArrangements(arrangements: ArrangementItem[]) {
  writeJsonValue(arrangementsStorageKey, arrangements);
  notifyArrangementChange();
}

export function createManualArrangement(input: {
  title: string;
  scheduledAt: number | null;
  location: string;
  relatedPeople: string[];
}) {
  const timestamp = Date.now();
  return {
    id: `arrangement-${timestamp}-${Math.random().toString(36).slice(2, 7)}`,
    title: input.title.trim(),
    scheduledAt: input.scheduledAt,
    location: input.location.trim(),
    relatedPeople: input.relatedPeople,
    source: "手动创建",
    status: "open" as const,
    createdAt: timestamp,
    updatedAt: timestamp,
    contexts: [
      {
        id: `context-manual-${timestamp}`,
        text: `手动创建安排：${input.title.trim()}`,
        senderName: "我",
        conversationLabel: "安排模块",
        sentAt: timestamp,
        source: "手动创建",
      },
    ],
  };
}

export function applyLocalArrangementRule(input: {
  text: string;
  senderName: string;
  conversationLabel: string;
  sentAt: number;
}): ArrangementRuleResult {
  const text = input.text.trim();
  if (text !== "后天去一趟医院" && text !== "爸爸：一定记得去医院") {
    return { action: "none" };
  }

  const current = getInitialArrangements();
  const timestamp = Date.now();
  const context: ArrangementContext = {
    id: `context-rule-${timestamp}-${Math.random().toString(36).slice(2, 7)}`,
    text,
    senderName: input.senderName,
    conversationLabel: input.conversationLabel,
    sentAt: input.sentAt,
    source: "本地规则模拟 AI 识别",
  };
  const existingIndex = current.findIndex(
    (arrangement) => arrangement.title === "去医院" && arrangement.status !== "completed"
  );

  if (existingIndex >= 0) {
    const existing = current[existingIndex];
    const merged: ArrangementItem = {
      ...existing,
      relatedPeople: Array.from(
        new Set([...existing.relatedPeople, input.senderName].filter(Boolean))
      ),
      source: existing.source.includes("本地规则") ? existing.source : "本地规则模拟 AI 识别",
      updatedAt: timestamp,
      contexts: [...existing.contexts, context],
    };
    const next = [...current];
    next[existingIndex] = merged;
    persistArrangements(next);
    return { action: "merged", arrangement: merged };
  }

  const scheduledAt = new Date(input.sentAt);
  scheduledAt.setDate(scheduledAt.getDate() + 2);
  scheduledAt.setHours(12, 0, 0, 0);

  const arrangement: ArrangementItem = {
    id: `arrangement-${timestamp}-${Math.random().toString(36).slice(2, 7)}`,
    title: "去医院",
    scheduledAt: scheduledAt.getTime(),
    location: "医院",
    relatedPeople: text.startsWith("爸爸") ? ["爸爸"] : [],
    source: "本地规则模拟 AI 识别",
    status: "open",
    createdAt: timestamp,
    updatedAt: timestamp,
    contexts: [context],
  };
  persistArrangements([...current, arrangement]);
  return { action: "created", arrangement };
}
