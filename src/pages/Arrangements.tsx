import React from "react";
import {
  arrangementsStorageEvent,
  arrangementsStorageKey,
  createManualArrangement,
  getInitialArrangements,
  persistArrangements,
  type ArrangementItem,
  type ArrangementStatus,
} from "@/data/arrangements";
import { cn } from "@/lib/utils";

const dateTimeFormatter = new Intl.DateTimeFormat("zh-CN", {
  month: "numeric",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function formatArrangementTime(value: number | null) {
  if (!value) return "时间待补充";
  return dateTimeFormatter.format(new Date(value));
}

function getStatusLabel(status: ArrangementStatus) {
  if (status === "completed") return "已完成";
  if (status === "later") return "以后再说";
  return "待安排";
}

function getRelativePeopleLabel(people: string[]) {
  return people.length > 0 ? people.join("、") : "暂无";
}

export default function Arrangements() {
  const [arrangements, setArrangements] = React.useState(getInitialArrangements);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [scheduledAt, setScheduledAt] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [relatedPeople, setRelatedPeople] = React.useState("");

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const refreshArrangements = () => setArrangements(getInitialArrangements());
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== arrangementsStorageKey) return;
      refreshArrangements();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(arrangementsStorageEvent, refreshArrangements);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(arrangementsStorageEvent, refreshArrangements);
    };
  }, []);

  const sortedArrangements = React.useMemo(
    () =>
      [...arrangements].sort((a, b) => {
        const statusWeight = (item: ArrangementItem) =>
          item.status === "open" ? 0 : item.status === "later" ? 1 : 2;
        const statusDiff = statusWeight(a) - statusWeight(b);
        if (statusDiff !== 0) return statusDiff;
        return (a.scheduledAt ?? a.createdAt) - (b.scheduledAt ?? b.createdAt);
      }),
    [arrangements]
  );
  const selectedArrangement =
    arrangements.find((arrangement) => arrangement.id === selectedId) ?? null;

  const updateArrangement = React.useCallback(
    (id: string, updater: (arrangement: ArrangementItem) => ArrangementItem) => {
      setArrangements((prev) => {
        const next = prev.map((arrangement) =>
          arrangement.id === id ? updater(arrangement) : arrangement
        );
        persistArrangements(next);
        return next;
      });
    },
    []
  );

  const handleCreate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedTitle = title.trim();
    if (!normalizedTitle) return;

    const arrangement = createManualArrangement({
      title: normalizedTitle,
      scheduledAt: scheduledAt ? new Date(scheduledAt).getTime() : null,
      location,
      relatedPeople: relatedPeople
        .split(/[，,]/)
        .map((item) => item.trim())
        .filter(Boolean),
    });
    setArrangements((prev) => {
      const next = [...prev, arrangement];
      persistArrangements(next);
      return next;
    });
    setSelectedId(arrangement.id);
    setShowCreateForm(false);
    setTitle("");
    setScheduledAt("");
    setLocation("");
    setRelatedPeople("");
  };

  const markCompleted = (id: string) => {
    updateArrangement(id, (arrangement) => ({
      ...arrangement,
      status: "completed",
      updatedAt: Date.now(),
    }));
  };

  const markLater = (id: string) => {
    updateArrangement(id, (arrangement) => ({
      ...arrangement,
      status: "later",
      updatedAt: Date.now(),
    }));
  };

  if (selectedArrangement) {
    return (
      <ArrangementDetail
        arrangement={selectedArrangement}
        onBack={() => setSelectedId(null)}
        onComplete={() => markCompleted(selectedArrangement.id)}
        onLater={() => markLater(selectedArrangement.id)}
      />
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-bg">
      <header className="flex h-14 shrink-0 items-center justify-between bg-bg px-4">
        <div>
          <h1 className="text-lg font-semibold text-text">安排</h1>
          <p className="text-[11px] leading-4 text-text-tertiary">
            先承接最近要落地的事
          </p>
        </div>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-text text-bg transition active:scale-[0.94]"
          onClick={() => setShowCreateForm((visible) => !visible)}
          aria-label="新建安排"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-5 pt-2">
        {showCreateForm && (
          <form
            className="mb-3 rounded-[12px] border border-border-light bg-surface px-3 pb-3 pt-3 shadow-[var(--shadow-sm)]"
            onSubmit={handleCreate}
          >
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="安排标题"
              className="h-10 w-full rounded-[10px] bg-input-bg px-3 text-[15px] text-text outline-none focus:[box-shadow:var(--shadow-focus)]"
            />
            <input
              value={scheduledAt}
              onChange={(event) => setScheduledAt(event.target.value)}
              type="datetime-local"
              className="mt-2 h-10 w-full rounded-[10px] bg-input-bg px-3 text-[14px] text-text outline-none focus:[box-shadow:var(--shadow-focus)]"
            />
            <div className="mt-2 grid grid-cols-2 gap-2">
              <input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="地点"
                className="h-10 min-w-0 rounded-[10px] bg-input-bg px-3 text-[14px] text-text outline-none focus:[box-shadow:var(--shadow-focus)]"
              />
              <input
                value={relatedPeople}
                onChange={(event) => setRelatedPeople(event.target.value)}
                placeholder="相关人，逗号分隔"
                className="h-10 min-w-0 rounded-[10px] bg-input-bg px-3 text-[14px] text-text outline-none focus:[box-shadow:var(--shadow-focus)]"
              />
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                className="h-9 rounded-[10px] px-3 text-[13px] text-text-muted transition active:scale-[0.96]"
                onClick={() => setShowCreateForm(false)}
              >
                取消
              </button>
              <button
                type="submit"
                className="h-9 rounded-[10px] bg-primary px-4 text-[13px] font-semibold text-on-primary transition active:scale-[0.96] disabled:opacity-40"
                disabled={!title.trim()}
              >
                创建
              </button>
            </div>
          </form>
        )}

        {sortedArrangements.length > 0 ? (
          <div className="space-y-2.5">
            {sortedArrangements.map((arrangement) => (
              <ArrangementCard
                key={arrangement.id}
                arrangement={arrangement}
                onOpen={() => setSelectedId(arrangement.id)}
                onComplete={() => markCompleted(arrangement.id)}
                onLater={() => markLater(arrangement.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center px-8 text-center">
            <div>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-surface text-primary">
                <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 2v4M16 2v4M4 9h16M6 5h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
                  <path d="m9 15 2 2 4-5" />
                </svg>
              </div>
              <p className="mt-4 text-sm font-semibold text-text">还没有安排</p>
              <p className="mt-1 text-xs leading-5 text-text-muted">
                可以手动创建，也可以去 /sendtest 发送“后天去一趟医院”试试本地识别。
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ArrangementCard({
  arrangement,
  onOpen,
  onComplete,
  onLater,
}: {
  arrangement: ArrangementItem;
  onOpen: () => void;
  onComplete: () => void;
  onLater: () => void;
}) {
  const isOverdue =
    arrangement.status === "open" &&
    arrangement.scheduledAt !== null &&
    arrangement.scheduledAt < Date.now();
  const isDimmed = arrangement.status !== "open" || isOverdue;

  return (
    <article
      className={cn(
        "rounded-[12px] border border-border-light bg-surface px-3 py-3 transition",
        isDimmed && "opacity-70"
      )}
    >
      <button type="button" className="block w-full text-left" onClick={onOpen}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-[16px] font-semibold leading-6 text-text">
              {arrangement.title}
            </h2>
            <p className="mt-0.5 text-[12px] leading-4 text-text-tertiary">
              {isOverdue ? "时间已过，先放在这里" : getStatusLabel(arrangement.status)}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-fill-4 px-2 py-1 text-[11px] text-text-muted">
            {arrangement.source}
          </span>
        </div>
        <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-[12px] leading-4">
          <MetaItem label="时间" value={formatArrangementTime(arrangement.scheduledAt)} />
          <MetaItem label="地点" value={arrangement.location || "暂无"} />
          <MetaItem label="相关人" value={getRelativePeopleLabel(arrangement.relatedPeople)} />
          <MetaItem label="来源" value={arrangement.source} />
        </dl>
      </button>
      {arrangement.status === "open" && (
        <div className="mt-3 flex justify-end gap-2">
          <button
            type="button"
            className="h-8 rounded-[10px] bg-fill-4 px-3 text-[12px] text-text-muted transition active:scale-[0.96]"
            onClick={onLater}
          >
            以后再说
          </button>
          <button
            type="button"
            className="h-8 rounded-[10px] bg-primary px-3 text-[12px] font-semibold text-on-primary transition active:scale-[0.96]"
            onClick={onComplete}
          >
            完成
          </button>
        </div>
      )}
    </article>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-text-tertiary">{label}</dt>
      <dd className="mt-0.5 truncate text-text-muted">{value}</dd>
    </div>
  );
}

function ArrangementDetail({
  arrangement,
  onBack,
  onComplete,
  onLater,
}: {
  arrangement: ArrangementItem;
  onBack: () => void;
  onComplete: () => void;
  onLater: () => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-bg">
      <header className="flex h-14 shrink-0 items-center border-b border-border-light bg-bg px-2">
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full text-text-muted transition active:scale-[0.96]"
          onClick={onBack}
          aria-label="返回安排列表"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="ml-1 truncate text-[17px] font-semibold text-text">安排详情</h1>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-5 pt-4">
        <section className="rounded-[12px] bg-surface px-4 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h2 className="text-[20px] font-semibold leading-7 text-text">
                {arrangement.title}
              </h2>
              <p className="mt-1 text-[12px] text-text-tertiary">
                {getStatusLabel(arrangement.status)}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-primary-soft px-2 py-1 text-[11px] text-primary">
              {arrangement.source}
            </span>
          </div>
          <dl className="mt-4 space-y-2 text-[13px] leading-5">
            <DetailMeta label="时间" value={formatArrangementTime(arrangement.scheduledAt)} />
            <DetailMeta label="地点" value={arrangement.location || "暂无"} />
            <DetailMeta label="相关人" value={getRelativePeopleLabel(arrangement.relatedPeople)} />
            <DetailMeta label="来源" value={arrangement.source} />
          </dl>
          {arrangement.status === "open" && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                className="h-10 rounded-[10px] bg-fill-4 text-[14px] text-text-muted transition active:scale-[0.96]"
                onClick={onLater}
              >
                以后再说
              </button>
              <button
                type="button"
                className="h-10 rounded-[10px] bg-primary text-[14px] font-semibold text-on-primary transition active:scale-[0.96]"
                onClick={onComplete}
              >
                完成安排
              </button>
            </div>
          )}
        </section>

        <section className="mt-4">
          <h3 className="px-1 text-[13px] font-semibold text-text">相关对话上下文</h3>
          <div className="mt-2 space-y-2">
            {arrangement.contexts.length > 0 ? (
              arrangement.contexts.map((context) => (
                <article key={context.id} className="rounded-[12px] bg-surface px-3 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-[13px] font-medium text-text">
                      {context.senderName} · {context.conversationLabel}
                    </p>
                    <span className="shrink-0 text-[11px] text-text-tertiary">
                      {dateTimeFormatter.format(new Date(context.sentAt))}
                    </span>
                  </div>
                  <p className="mt-2 text-[14px] leading-6 text-text-muted">
                    {context.text}
                  </p>
                  <p className="mt-2 text-[11px] leading-4 text-text-tertiary">
                    {context.source}
                  </p>
                </article>
              ))
            ) : (
              <p className="rounded-[12px] bg-surface px-3 py-4 text-center text-[13px] text-text-tertiary">
                暂无上下文
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function DetailMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="shrink-0 text-text-tertiary">{label}</dt>
      <dd className="min-w-0 text-right text-text">{value}</dd>
    </div>
  );
}
