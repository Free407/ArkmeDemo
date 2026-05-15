export type TestIdentity = {
  id: string;
  name: string;
  note: string;
  avatarLabel: string;
  color: string;
  createdAt: number;
};

export type TestMessageSender = "identity" | "demo";

export type TestMessage = {
  id: string;
  identityId: string;
  text: string;
  sentAt: number;
  sender: TestMessageSender;
};

export type TestReadState = Record<string, number>;

export const testIdentitiesStorageKey = "arkme-demo.testIdentities";
export const testMessagesStorageKey = "arkme-demo.testMessages";
export const testReadStateStorageKey = "arkme-demo.testReadState";
export const testConversationStorageEvent = "arkme-demo:test-conversations-updated";

const identityColors = [
  "#09B83E",
  "#0E9DEC",
  "#8363FF",
  "#E04DAE",
  "#F59E0B",
  "#14B8A6",
];

const defaultIdentities: TestIdentity[] = [
  {
    id: "identity-interviewer",
    name: "面试官",
    note: "用于模拟私聊追问和反馈",
    avatarLabel: "面",
    color: identityColors[0],
    createdAt: 1760000000000,
  },
  {
    id: "identity-user-a",
    name: "用户A",
    note: "用于模拟普通用户私聊",
    avatarLabel: "A",
    color: identityColors[1],
    createdAt: 1760000001000,
  },
];

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
    // Keep the in-memory UI usable if localStorage is unavailable.
  }
}

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeTimestamp(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function buildAvatarLabel(name: string) {
  const trimmedName = name.trim();
  if (!trimmedName) return "测";
  return Array.from(trimmedName)[0].toUpperCase();
}

export function pickIdentityColor(index: number) {
  return identityColors[index % identityColors.length];
}

function normalizeIdentity(value: unknown, index: number): TestIdentity | null {
  if (!value || typeof value !== "object") return null;

  const identity = value as Partial<TestIdentity>;
  const name = normalizeText(identity.name);
  if (!name) return null;

  const id = normalizeText(identity.id) || `identity-${index}`;
  const avatarLabel = normalizeText(identity.avatarLabel) || buildAvatarLabel(name);
  const color = normalizeText(identity.color) || pickIdentityColor(index);

  return {
    id,
    name,
    note: normalizeText(identity.note),
    avatarLabel: Array.from(avatarLabel).slice(0, 2).join(""),
    color,
    createdAt: normalizeTimestamp(identity.createdAt, Date.now() + index),
  };
}

function normalizeMessage(value: unknown, index: number): TestMessage | null {
  if (!value || typeof value !== "object") return null;

  const message = value as Partial<TestMessage>;
  const identityId = normalizeText(message.identityId);
  const text = normalizeText(message.text);
  if (!identityId || !text) return null;

  return {
    id: normalizeText(message.id) || `message-${index}`,
    identityId,
    text,
    sentAt: normalizeTimestamp(message.sentAt, Date.now() + index),
    sender: message.sender === "demo" ? "demo" : "identity",
  };
}

export function getInitialTestIdentities() {
  const parsedValue = readJsonValue(testIdentitiesStorageKey);
  if (!Array.isArray(parsedValue)) return defaultIdentities;

  const identities = parsedValue
    .map(normalizeIdentity)
    .filter((identity): identity is TestIdentity => Boolean(identity));

  return identities.length > 0 ? identities : defaultIdentities;
}

export function getInitialTestMessages() {
  const parsedValue = readJsonValue(testMessagesStorageKey);
  if (!Array.isArray(parsedValue)) return [];

  return parsedValue
    .map(normalizeMessage)
    .filter((message): message is TestMessage => Boolean(message));
}

export function getInitialTestReadState() {
  const parsedValue = readJsonValue(testReadStateStorageKey);
  if (!parsedValue || typeof parsedValue !== "object" || Array.isArray(parsedValue)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(parsedValue)
      .filter((entry): entry is [string, number] => {
        const [, value] = entry;
        return typeof value === "number" && Number.isFinite(value);
      })
  );
}

export function persistTestIdentities(identities: TestIdentity[]) {
  writeJsonValue(testIdentitiesStorageKey, identities);
  notifyTestConversationChange();
}

export function persistTestMessages(messages: TestMessage[]) {
  writeJsonValue(testMessagesStorageKey, messages);
  notifyTestConversationChange();
}

export function persistTestReadState(readState: TestReadState) {
  writeJsonValue(testReadStateStorageKey, readState);
}

export function notifyTestConversationChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(testConversationStorageEvent));
}

export function createTestIdentity(name: string, note: string, index: number): TestIdentity {
  const timestamp = Date.now();
  return {
    id: `identity-${timestamp}-${Math.random().toString(36).slice(2, 7)}`,
    name: name.trim(),
    note: note.trim(),
    avatarLabel: buildAvatarLabel(name),
    color: pickIdentityColor(index),
    createdAt: timestamp,
  };
}

export function createTestMessage(identityId: string, text: string): TestMessage {
  const timestamp = Date.now();
  return {
    id: `message-${timestamp}-${Math.random().toString(36).slice(2, 7)}`,
    identityId,
    text: text.trim(),
    sentAt: timestamp,
    sender: "identity",
  };
}

export function createTestReplyMessage(identityId: string, text: string): TestMessage {
  const timestamp = Date.now();
  return {
    id: `reply-${timestamp}-${Math.random().toString(36).slice(2, 7)}`,
    identityId,
    text: text.trim(),
    sentAt: timestamp,
    sender: "demo",
  };
}
