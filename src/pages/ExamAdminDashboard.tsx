import React from "react";
import {
  examCandidates,
  type ExamCandidate,
  type ExamCandidateStatus,
  type ExamSyncHealth,
} from "@/data/examCandidates";
import { setCandidateProfileName } from "@/data/candidateProfile";
import { cn } from "@/lib/utils";

type ExamAdminTab = "resume" | "iterations" | "visibility" | "sync";
type CandidateFilter = "all" | ExamCandidateStatus;

const viewerStorageKey = "arkme-demo.examViewerCandidateId";

const statusLabel: Record<ExamCandidateStatus, string> = {
  not_started: "未开始",
  active: "答题中",
  submitted: "已提交",
};

const syncHealthLabel: Record<ExamSyncHealth, string> = {
  healthy: "同步正常",
  warning: "待处理",
  offline: "未连接",
};

const tabLabels: Record<ExamAdminTab, string> = {
  resume: "我的简历",
  iterations: "我的AI过程",
  visibility: "公开设置",
  sync: "同步记录",
};

export default function ExamAdminDashboard() {
  const [query, setQuery] = React.useState("");
  const [filter, setFilter] = React.useState<CandidateFilter>("all");
  const [activeTab, setActiveTab] = React.useState<ExamAdminTab>("resume");
  const [loginName, setLoginName] = React.useState("");
  const [loginPhone, setLoginPhone] = React.useState("");
  const [loginError, setLoginError] = React.useState("");
  const [showLoginDialog, setShowLoginDialog] = React.useState(false);
  const [viewerCandidateId, setViewerCandidateId] = React.useState(() =>
    getStoredViewerCandidateId()
  );
  const viewerCandidate =
    examCandidates.find((candidate) => candidate.id === viewerCandidateId) ?? null;
  const [resumePublic, setResumePublic] = React.useState(
    viewerCandidate?.resumePublic ?? false
  );
  const [aiContextPublic, setAiContextPublic] = React.useState(
    viewerCandidate?.aiContextPublic ?? false
  );

  React.useEffect(() => {
    setResumePublic(viewerCandidate?.resumePublic ?? false);
    setAiContextPublic(viewerCandidate?.aiContextPublic ?? false);
  }, [viewerCandidate?.id, viewerCandidate?.resumePublic, viewerCandidate?.aiContextPublic]);

  const filteredCandidates = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return examCandidates.filter((candidate) => {
      const matchesFilter = filter === "all" || candidate.status === filter;
      const visibleName = getVisibleCandidateName(candidate, viewerCandidate);
      const matchesQuery =
        !normalizedQuery ||
        visibleName.toLowerCase().includes(normalizedQuery) ||
        candidate.roleTarget.toLowerCase().includes(normalizedQuery) ||
        statusLabel[candidate.status].includes(normalizedQuery);
      return matchesFilter && matchesQuery;
    });
  }, [filter, query, viewerCandidate]);

  const startedCount = examCandidates.filter(
    (candidate) => candidate.status !== "not_started"
  ).length;
  const totalInputs = examCandidates.reduce(
    (sum, candidate) => sum + candidate.inputCount,
    0
  );
  const totalCharacters = examCandidates.reduce(
    (sum, candidate) => sum + candidate.inputCharacters,
    0
  );
  const publicCount = examCandidates.filter(
    (candidate) => candidate.resumePublic || candidate.aiContextPublic
  ).length;

  const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const matchedCandidate = findCandidateByLogin(loginName, loginPhone);
    if (!matchedCandidate) {
      setLoginError("未匹配到已导入的简历，请确认姓名和手机号是否与投递简历一致。");
      return;
    }

    setLoginError("");
    setViewerCandidateId(matchedCandidate.id);
    setActiveTab("resume");
    setShowLoginDialog(false);
    setCandidateProfileName(matchedCandidate.name);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(viewerStorageKey, matchedCandidate.id);
    }
  };

  return (
    <div className="flex h-[calc(100vh-48px)] w-full self-stretch flex-col overflow-hidden bg-[var(--admin-bg)] text-text">
      <header className="z-40 shrink-0 border-b border-[var(--admin-border-subtle)] bg-[var(--admin-header-bg)] [box-shadow:var(--admin-header-shadow)] backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-4 px-5 py-4 xl:px-0">
          <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
            <div className="min-w-0">
              <h1 className="text-[22px] font-normal leading-8 text-text">
                森奇思 笔试后台
              </h1>
              <p className="mt-0.5 text-[13px] leading-5 text-text-tertiary">
                未登录可阅读题目和匿名动态；登录后查看自己的提交、简历和公开设置
              </p>
            </div>
            <HeaderIdentity
              candidate={viewerCandidate}
              onLoginClick={() => {
                setLoginError("");
                setShowLoginDialog(true);
              }}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <MetricItem label="已开始" value={`${startedCount}/${examCandidates.length}`} />
            <MetricItem label="累计输入轮次" value={formatNumber(totalInputs)} />
            <MetricItem label="累计输入字数" value={formatNumber(totalCharacters)} />
            <MetricItem label="已开放资料" value={`${publicCount} 人`} />
          </div>
        </div>
      </header>

      <main className="mx-auto grid min-h-0 w-full max-w-[1280px] flex-1 gap-4 overflow-y-auto px-5 py-4 xl:grid-cols-[340px_minmax(0,1fr)] xl:overflow-hidden xl:px-0">
        <aside className="flex min-h-[420px] flex-col gap-4 overflow-visible xl:min-h-0 xl:overflow-hidden">
          <section className="flex min-h-[260px] flex-1 flex-col overflow-hidden rounded-[14px] border border-[var(--admin-border)] bg-[var(--admin-panel-bg)] [box-shadow:var(--admin-panel-shadow)]">
            <div className="shrink-0 border-b border-[var(--admin-border-subtle)] p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-[15px] font-semibold leading-6 text-text">
                    候选人动态
                  </h2>
                  <p className="mt-0.5 text-[12px] leading-5 text-text-tertiary">
                    他人仅显示匿名摘要，详情只对本人和官方开放
                  </p>
                </div>
              </div>
              <label className="mt-3 block text-[12px] font-medium leading-5 text-text-tertiary">
                搜索动态
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="姓氏、岗位、状态"
                  className="mt-1.5 h-10 w-full rounded-[10px] border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 text-[14px] text-text outline-none transition placeholder:text-input-placeholder focus:border-primary focus:[box-shadow:var(--admin-input-focus-shadow)]"
                />
              </label>
              <div className="mt-3 flex flex-wrap gap-2">
                {(
                  [
                    ["all", "全部"],
                    ["active", "答题中"],
                    ["not_started", "未开始"],
                    ["submitted", "已提交"],
                  ] satisfies Array<[CandidateFilter, string]>
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    className={cn(
                      "h-8 rounded-[10px] px-3 text-[12px] font-medium transition focus:outline-none focus-visible:[box-shadow:var(--admin-input-focus-shadow)]",
                      filter === value
                        ? "bg-primary text-on-primary"
                        : "border border-[var(--admin-border)] text-text-tertiary hover:bg-hover-overlay"
                    )}
                    onClick={() => setFilter(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-2">
              {filteredCandidates.length > 0 ? (
                filteredCandidates.map((candidate) => (
                  <CandidateListItem
                    key={candidate.id}
                    candidate={candidate}
                    displayName={getVisibleCandidateName(candidate, viewerCandidate)}
                    active={candidate.id === viewerCandidate?.id}
                    locked={candidate.id !== viewerCandidate?.id}
                  />
                ))
              ) : (
                <div className="px-4 py-10 text-center text-[13px] leading-5 text-text-tertiary">
                  没有匹配的候选人动态
                </div>
              )}
            </div>
          </section>
        </aside>

        <section className="flex min-h-[640px] flex-col overflow-hidden rounded-[14px] border border-[var(--admin-border)] bg-[var(--admin-panel-bg)] [box-shadow:var(--admin-panel-shadow)] xl:min-h-0">
          <div className="min-h-0 flex-1 overflow-y-auto p-5">
            <ExamBrief />
            {viewerCandidate ? (
              <div className="mt-5 overflow-hidden rounded-[14px] border border-[var(--admin-border-subtle)] bg-bg">
                <CandidateHeader candidate={viewerCandidate} />
                <div className="shrink-0 border-b border-[var(--admin-border-subtle)] px-5">
                  <div className="flex gap-1 overflow-x-auto py-2">
                    {(Object.keys(tabLabels) as ExamAdminTab[]).map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        className={cn(
                          "h-9 shrink-0 rounded-[10px] px-3 text-[13px] font-medium transition focus:outline-none focus-visible:[box-shadow:var(--admin-input-focus-shadow)]",
                          activeTab === tab
                            ? "bg-primary-selected text-text"
                            : "text-text-tertiary hover:bg-hover-overlay"
                        )}
                        onClick={() => setActiveTab(tab)}
                      >
                        {tabLabels[tab]}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="p-5">
                  {activeTab === "resume" && (
                    <ResumeTab candidate={viewerCandidate} />
                  )}
                  {activeTab === "iterations" && (
                    <IterationsTab candidate={viewerCandidate} />
                  )}
                  {activeTab === "visibility" && (
                    <VisibilityTab
                      candidate={viewerCandidate}
                      resumePublic={resumePublic}
                      aiContextPublic={aiContextPublic}
                      onResumePublicChange={setResumePublic}
                      onAiContextPublicChange={setAiContextPublic}
                    />
                  )}
                  {activeTab === "sync" && <SyncTab candidate={viewerCandidate} />}
                </div>
              </div>
            ) : (
              <LockedDetailPanel />
            )}
          </div>
        </section>
      </main>
      {showLoginDialog ? (
        <LoginDialog
          loginName={loginName}
          loginPhone={loginPhone}
          loginError={loginError}
          onLoginNameChange={setLoginName}
          onLoginPhoneChange={setLoginPhone}
          onSubmit={handleLogin}
          onClose={() => {
            setShowLoginDialog(false);
            setLoginError("");
          }}
        />
      ) : null}
    </div>
  );
}

function MetricItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-[12px] border border-[var(--admin-border-subtle)] bg-[var(--admin-panel-bg)] px-4 py-3">
      <div className="truncate text-[12px] leading-5 text-text-tertiary">
        {label}
      </div>
      <div className="mt-1 truncate text-[22px] font-semibold leading-7 text-text">
        {value}
      </div>
    </div>
  );
}

function HeaderIdentity({
  candidate,
  onLoginClick,
}: {
  candidate: ExamCandidate | null;
  onLoginClick: () => void;
}) {
  if (!candidate) {
    return (
      <button
        type="button"
        onClick={onLoginClick}
        className="inline-flex h-10 shrink-0 items-center justify-center rounded-[10px] bg-text px-4 text-[13px] font-medium text-bg transition hover:opacity-[0.86] active:scale-[0.98] focus:outline-none focus-visible:[box-shadow:var(--admin-input-focus-shadow)]"
      >
        现在登录
      </button>
    );
  }

  return (
    <div className="inline-flex h-12 shrink-0 items-center gap-3 rounded-[12px] border border-[var(--admin-border)] bg-[var(--admin-panel-bg)] px-3">
      <CandidateAvatar candidate={candidate} />
      <div className="min-w-0 text-left">
        <div className="truncate text-[13px] font-semibold leading-5 text-text">
          {candidate.name}
        </div>
        <div className="truncate text-[12px] leading-4 text-text-tertiary">
          {candidate.phoneMasked}
        </div>
      </div>
    </div>
  );
}

function LoginDialog({
  loginName,
  loginPhone,
  loginError,
  onLoginNameChange,
  onLoginPhoneChange,
  onSubmit,
  onClose,
}: {
  loginName: string;
  loginPhone: string;
  loginError: string;
  onLoginNameChange: (value: string) => void;
  onLoginPhoneChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="candidate-login-title"
    >
      <div className="w-full max-w-[420px] rounded-[16px] border border-[var(--admin-border)] bg-[var(--admin-dialog-bg)] p-5 [box-shadow:var(--admin-floating-shadow)]">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2
              id="candidate-login-title"
              className="text-[17px] font-semibold leading-7 text-text"
            >
              候选人登录
            </h2>
            <p className="mt-1 text-[12px] leading-5 text-text-tertiary">
              使用简历中的姓名和手机号匹配已导入简历。
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--admin-border)] text-[18px] leading-none text-text-tertiary transition hover:bg-hover-overlay focus:outline-none focus-visible:[box-shadow:var(--admin-input-focus-shadow)]"
            aria-label="关闭登录弹窗"
          >
            ×
          </button>
        </div>
        <form className="mt-4 space-y-3" onSubmit={onSubmit}>
          <label className="block text-[12px] font-medium leading-5 text-text-tertiary">
            姓名
            <input
              value={loginName}
              onChange={(event) => onLoginNameChange(event.target.value)}
              placeholder="请输入简历姓名"
              className="mt-1.5 h-10 w-full rounded-[10px] border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 text-[14px] text-text outline-none transition placeholder:text-input-placeholder focus:border-primary focus:[box-shadow:var(--admin-input-focus-shadow)]"
            />
          </label>
          <label className="block text-[12px] font-medium leading-5 text-text-tertiary">
            手机号
            <input
              value={loginPhone}
              onChange={(event) => onLoginPhoneChange(event.target.value)}
              placeholder="测试数据可输入手机号后四位"
              inputMode="numeric"
              className="mt-1.5 h-10 w-full rounded-[10px] border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 text-[14px] text-text outline-none transition placeholder:text-input-placeholder focus:border-primary focus:[box-shadow:var(--admin-input-focus-shadow)]"
            />
          </label>
          {loginError ? (
            <div className="rounded-[10px] border border-danger/20 bg-danger/5 px-3 py-2 text-[12px] leading-5 text-danger">
              {loginError}
            </div>
          ) : null}
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-[10px] border border-[var(--admin-border)] px-4 text-[13px] font-medium text-text transition hover:bg-hover-overlay focus:outline-none focus-visible:[box-shadow:var(--admin-input-focus-shadow)]"
            >
              取消
            </button>
            <button
              type="submit"
              className="h-10 rounded-[10px] bg-text px-4 text-[13px] font-medium text-bg transition hover:opacity-[0.86] active:scale-[0.98] focus:outline-none focus-visible:[box-shadow:var(--admin-input-focus-shadow)]"
            >
              登录查看我的信息
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
function CandidateListItem({
  candidate,
  displayName,
  active,
  locked,
}: {
  candidate: ExamCandidate;
  displayName: string;
  active: boolean;
  locked: boolean;
}) {
  return (
    <div
      className={cn(
        "mb-1 flex w-full items-start gap-3 rounded-[12px] px-3 py-3 text-left transition",
        active ? "bg-primary-selected" : "bg-transparent"
      )}
    >
      <CandidateAvatar candidate={candidate} displayName={displayName} muted={locked} />
      <span className="min-w-0 flex-1">
        <span className="flex min-w-0 items-center justify-between gap-3">
          <span className="truncate text-[14px] font-semibold leading-5 text-text">
            {displayName}
          </span>
          <StatusPill status={candidate.status} />
        </span>
        <span className="mt-1 block truncate text-[12px] leading-5 text-text-tertiary">
          {candidate.roleTarget} · {locked ? "详情不可见" : candidate.phoneMasked}
        </span>
        <span className="mt-1 flex items-center justify-between gap-3 text-[12px] leading-5 text-text-tertiary">
          <span>
            {candidate.inputCount} 条 / {formatNumber(candidate.inputCharacters)} 字
          </span>
          <span className="truncate">
            {candidate.latestInputAt ?? "暂无输入"}
          </span>
        </span>
      </span>
    </div>
  );
}

function CandidateHeader({ candidate }: { candidate: ExamCandidate }) {
  return (
    <div className="shrink-0 border-b border-[var(--admin-border-subtle)] p-5">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div className="flex min-w-0 items-start gap-4">
          <CandidateAvatar candidate={candidate} size="large" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-[20px] font-semibold leading-7 text-text">
                {candidate.name}
              </h2>
              <StatusPill status={candidate.status} />
              <SyncHealthPill health={candidate.syncHealth} />
            </div>
            <p className="mt-1 text-[13px] leading-5 text-text-tertiary">
              {candidate.roleTarget} · {candidate.phoneMasked} · {candidate.bindStatus}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:min-w-[420px]">
          <MiniStat label="输入条数" value={`${candidate.inputCount} 条`} />
          <MiniStat label="输入字数" value={formatNumber(candidate.inputCharacters)} />
          <MiniStat label="最近输入" value={candidate.latestInputAt ?? "暂无"} />
          <MiniStat label="同步状态" value={syncHealthLabel[candidate.syncHealth]} />
        </div>
      </div>
    </div>
  );
}

function ExamBrief() {
  return (
    <section className="rounded-[14px] border border-[var(--admin-border-subtle)] bg-bg p-5">
      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-start">
        <div className="min-w-0">
          <h2 className="text-[18px] font-semibold leading-7 text-text">
            笔试题信息
          </h2>
          <p className="mt-1 text-[13px] leading-6 text-text-tertiary">
            请在 Codex 中打开项目后先阅读 AGENTS.md 和 docs/candidate-rules.md，再按题目完成即我移动端 Demo 的需求迭代。
          </p>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-9 shrink-0 items-center justify-center rounded-[10px] border border-[var(--admin-border)] px-3 text-[13px] font-medium text-text transition hover:bg-hover-overlay focus:outline-none focus-visible:[box-shadow:var(--admin-input-focus-shadow)]"
        >
          查看当前 Demo
        </a>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <BriefItem
          title="开始方式"
          description="候选人先让 AI 助手读取项目规范，再开始分析、修改和验证。"
        />
        <BriefItem
          title="答题范围"
          description="围绕移动端优先的即我 Demo 做产品和前端实现，不预置无关模块。"
        />
        <BriefItem
          title="过程记录"
          description="每一轮 Codex 协作都需要同步写入 Markdown 日志和应用内 AI 对话数据源。"
        />
        <BriefItem
          title="同步说明"
          description="仅同步本项目内的候选人输入、AI 输出、改动文件和验证结果，不读取其他项目内容。"
        />
      </div>
    </section>
  );
}

function BriefItem({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-[12px] border border-[var(--admin-border-subtle)] bg-[var(--admin-panel-bg)] px-4 py-3">
      <h3 className="text-[13px] font-semibold leading-5 text-text">{title}</h3>
      <p className="mt-1 text-[12px] leading-5 text-text-tertiary">
        {description}
      </p>
    </div>
  );
}

function LockedDetailPanel() {
  return (
    <section className="mt-5 rounded-[14px] border border-[var(--admin-border-subtle)] bg-bg p-5">
      <h2 className="text-[17px] font-semibold leading-7 text-text">
        登录后查看个人后台
      </h2>
      <p className="mt-1 text-[13px] leading-6 text-text-tertiary">
        未登录状态下只能查看题目和候选人匿名动态。即使其他候选人公开了简历或 AI 编程上下文，详情也不会在未登录状态展示。
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <BriefItem title="我的提交" description="查看自己的输入轮次、字数、最近同步时间和提交状态。" />
        <BriefItem title="我的简历" description="登录后读取已导入简历，后续可用于题目身份校验。" />
        <BriefItem title="公开设置" description="自己决定是否向其他候选人开放简历和 AI 编程上下文。" />
      </div>
    </section>
  );
}

function ResumeTab({ candidate }: { candidate: ExamCandidate }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
      <section className="rounded-[12px] border border-[var(--admin-border-subtle)] bg-[var(--admin-panel-bg)] p-4">
        <h3 className="text-[15px] font-semibold leading-6 text-text">
          简历摘要
        </h3>
        <p className="mt-2 text-[13px] leading-6 text-text-secondary">
          {candidate.resume.summary}
        </p>
        <div className="mt-4 rounded-[10px] bg-hover-overlay px-3 py-2 text-[12px] leading-5 text-text-tertiary">
          文件：{candidate.resume.fileName} · 导入：{candidate.resume.importedAt}
        </div>
      </section>
      <section className="rounded-[12px] border border-[var(--admin-border-subtle)] bg-[var(--admin-panel-bg)] p-4">
        <h3 className="text-[15px] font-semibold leading-6 text-text">
          亮点
        </h3>
        <ul className="mt-3 space-y-2">
          {candidate.resume.highlights.map((item) => (
            <li
              key={item}
              className="rounded-[10px] bg-hover-overlay px-3 py-2 text-[13px] leading-5 text-text-secondary"
            >
              {item}
            </li>
          ))}
        </ul>
      </section>
      <section className="rounded-[12px] border border-[var(--admin-border-subtle)] bg-[var(--admin-panel-bg)] p-4 lg:col-span-2">
        <h3 className="text-[15px] font-semibold leading-6 text-text">
          经历
        </h3>
        <div className="mt-3 space-y-2">
          {candidate.resume.experience.map((item) => (
            <div
              key={item}
              className="rounded-[10px] border border-[var(--admin-border-subtle)] px-3 py-2 text-[13px] leading-5 text-text-secondary"
            >
              {item}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function IterationsTab({ candidate }: { candidate: ExamCandidate }) {
  if (candidate.iterations.length === 0) {
    return (
      <div className="rounded-[12px] border border-dashed border-[var(--admin-border)] px-4 py-10 text-center text-[13px] leading-6 text-text-tertiary">
        还没有同步到 AI 编程过程。候选人在 Codex 项目中登录校验后会开始写入。
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {candidate.iterations.map((iteration, index) => (
        <article
          key={iteration.id}
          className="rounded-[12px] border border-[var(--admin-border-subtle)] bg-[var(--admin-panel-bg)] p-4"
        >
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div className="text-[14px] font-semibold leading-6 text-text">
              第 {index + 1} 轮 · {iteration.occurredAt}
            </div>
            <div className="text-[12px] leading-5 text-text-tertiary">
              改动 {iteration.changedFiles.length} 个文件
            </div>
          </div>
          <ConversationBlock title="候选人输入" content={iteration.userInput} />
          <ConversationBlock title="AI 输出" content={iteration.aiOutput} />
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <InfoList title="改动文件" items={iteration.changedFiles} empty="无业务改动" />
            <InfoList title="验证结果" items={iteration.verification} empty="未记录验证" />
          </div>
        </article>
      ))}
    </div>
  );
}

function VisibilityTab({
  candidate,
  resumePublic,
  aiContextPublic,
  onResumePublicChange,
  onAiContextPublicChange,
}: {
  candidate: ExamCandidate;
  resumePublic: boolean;
  aiContextPublic: boolean;
  onResumePublicChange: (value: boolean) => void;
  onAiContextPublicChange: (value: boolean) => void;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <section className="rounded-[12px] border border-[var(--admin-border-subtle)] bg-[var(--admin-panel-bg)] p-4">
        <h3 className="text-[15px] font-semibold leading-6 text-text">
          候选人公开设置
        </h3>
        <p className="mt-1 text-[13px] leading-5 text-text-tertiary">
          这里控制对其他已登录候选人可见的内容；官方团队始终可以查看完整过程。
        </p>
        <div className="mt-4 space-y-3">
          <VisibilityRow
            title="向其他候选人开放我的简历"
            description="开启后，其他已登录候选人可以查看你的简历摘要、亮点和经历。"
            enabled={resumePublic}
            onToggle={() => onResumePublicChange(!resumePublic)}
          />
          <VisibilityRow
            title="向其他候选人开放我的 AI 编程上下文"
            description="开启后，其他已登录候选人可以查看你公开的输入、AI 输出和验证记录。"
            enabled={aiContextPublic}
            onToggle={() => onAiContextPublicChange(!aiContextPublic)}
          />
        </div>
      </section>
      <section className="rounded-[12px] border border-[var(--admin-border-subtle)] bg-[var(--admin-panel-bg)] p-4">
        <h3 className="text-[15px] font-semibold leading-6 text-text">
          公开后的他人视角
        </h3>
        <div className="mt-3 space-y-3 text-[13px] leading-5 text-text-secondary">
          <div className="rounded-[10px] bg-hover-overlay px-3 py-2">
            姓名：{candidate.name}
          </div>
          <div className="rounded-[10px] bg-hover-overlay px-3 py-2">
            简历：{resumePublic ? "可查看摘要" : "不开放"}
          </div>
          <div className="rounded-[10px] bg-hover-overlay px-3 py-2">
            AI 上下文：{aiContextPublic ? "可查看公开过程" : "不开放"}
          </div>
        </div>
        <div className="mt-4 rounded-[10px] border border-[var(--admin-border-subtle)] px-3 py-2 text-[12px] leading-5 text-text-tertiary">
          未登录用户仍只能看到 {maskCandidateName(candidate.name)} 这类匿名名称和统计摘要。
        </div>
      </section>
      <section className="rounded-[12px] border border-[var(--admin-border-subtle)] bg-[var(--admin-panel-bg)] p-4 lg:col-span-2">
        <h3 className="text-[15px] font-semibold leading-6 text-text">
          设置变更记录
        </h3>
        <div className="mt-3 space-y-2">
          {candidate.auditEvents.length > 0 ? (
            candidate.auditEvents.map((event) => (
              <div
                key={event.id}
                className="flex flex-col gap-1 rounded-[10px] border border-[var(--admin-border-subtle)] px-3 py-2 text-[13px] leading-5 text-text-secondary sm:flex-row sm:items-center sm:justify-between"
              >
                <span>{event.description}</span>
                <span className="text-[12px] text-text-tertiary">
                  {event.occurredAt}
                </span>
              </div>
            ))
          ) : (
            <div className="rounded-[10px] border border-dashed border-[var(--admin-border)] px-3 py-8 text-center text-[13px] text-text-tertiary">
              暂无设置变更记录
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function SyncTab({ candidate }: { candidate: ExamCandidate }) {
  return (
    <div className="space-y-3">
      {candidate.syncEvents.map((event) => (
        <div
          key={event.id}
          className="rounded-[12px] border border-[var(--admin-border-subtle)] bg-[var(--admin-panel-bg)] p-4"
        >
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <SyncEventDot status={event.status} />
              <span className="text-[14px] font-semibold leading-6 text-text">
                {event.description}
              </span>
            </div>
            <span className="text-[12px] leading-5 text-text-tertiary">
              {event.occurredAt}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function CandidateAvatar({
  candidate,
  displayName,
  muted,
  size = "normal",
}: {
  candidate: ExamCandidate;
  displayName?: string;
  muted?: boolean;
  size?: "normal" | "large";
}) {
  const label = Array.from(displayName ?? candidate.name).at(-1) ?? "候";
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold",
        size === "large" ? "h-14 w-14 text-[18px]" : "h-10 w-10 text-[14px]",
        muted ? "bg-hover-overlay text-text-tertiary" : "bg-primary text-on-primary"
      )}
    >
      {label}
    </span>
  );
}

function StatusPill({ status }: { status: ExamCandidateStatus }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 shrink-0 items-center rounded-full px-2 text-[11px] font-medium",
        status === "active" && "bg-success/10 text-success",
        status === "submitted" && "bg-primary-selected text-primary",
        status === "not_started" && "bg-hover-overlay text-text-tertiary"
      )}
    >
      {statusLabel[status]}
    </span>
  );
}

function SyncHealthPill({ health }: { health: ExamSyncHealth }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 shrink-0 items-center rounded-full px-2 text-[11px] font-medium",
        health === "healthy" && "bg-success/10 text-success",
        health === "warning" && "bg-warning/10 text-warning",
        health === "offline" && "bg-hover-overlay text-text-tertiary"
      )}
    >
      {syncHealthLabel[health]}
    </span>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-[10px] border border-[var(--admin-border-subtle)] bg-bg px-3 py-2">
      <div className="truncate text-[11px] leading-4 text-text-tertiary">
        {label}
      </div>
      <div className="mt-1 truncate text-[13px] font-semibold leading-5 text-text">
        {value}
      </div>
    </div>
  );
}

function VisibilityRow({
  title,
  description,
  enabled,
  onToggle,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex flex-col justify-between gap-3 rounded-[12px] border border-[var(--admin-border-subtle)] px-3 py-3 sm:flex-row sm:items-center">
      <div className="min-w-0">
        <div className="text-[14px] font-semibold leading-5 text-text">{title}</div>
        <div className="mt-1 text-[12px] leading-5 text-text-tertiary">
          {description}
        </div>
      </div>
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "h-8 shrink-0 rounded-[10px] px-3 text-[12px] font-medium transition focus:outline-none focus-visible:[box-shadow:var(--admin-input-focus-shadow)]",
          enabled
            ? "bg-success text-on-primary"
            : "border border-[var(--admin-border)] text-text-tertiary hover:bg-hover-overlay"
        )}
      >
        {enabled ? "已公开" : "未公开"}
      </button>
    </div>
  );
}

function ConversationBlock({ title, content }: { title: string; content: string }) {
  return (
    <div className="mt-3 rounded-[10px] bg-hover-overlay px-3 py-2">
      <div className="text-[12px] font-semibold leading-5 text-text-tertiary">
        {title}
      </div>
      <p className="mt-1 whitespace-pre-wrap text-[13px] leading-6 text-text-secondary">
        {content}
      </p>
    </div>
  );
}

function InfoList({
  title,
  items,
  empty,
}: {
  title: string;
  items: string[];
  empty: string;
}) {
  return (
    <div className="rounded-[10px] border border-[var(--admin-border-subtle)] px-3 py-2">
      <div className="text-[12px] font-semibold leading-5 text-text-tertiary">
        {title}
      </div>
      <div className="mt-1 space-y-1">
        {items.length > 0 ? (
          items.map((item) => (
            <div
              key={item}
              className="break-words text-[12px] leading-5 text-text-secondary"
            >
              {item}
            </div>
          ))
        ) : (
          <div className="text-[12px] leading-5 text-text-tertiary">{empty}</div>
        )}
      </div>
    </div>
  );
}

function SyncEventDot({
  status,
}: {
  status: "success" | "pending" | "failed";
}) {
  return (
    <span
      className={cn(
        "h-2.5 w-2.5 rounded-full",
        status === "success" && "bg-success",
        status === "pending" && "bg-warning",
        status === "failed" && "bg-danger"
      )}
    />
  );
}

function getStoredViewerCandidateId() {
  if (typeof window === "undefined") return null;
  const storedId = window.localStorage.getItem(viewerStorageKey);
  return examCandidates.some((candidate) => candidate.id === storedId)
    ? storedId
    : null;
}

function findCandidateByLogin(name: string, phone: string) {
  const normalizedName = name.trim();
  const phoneDigits = phone.replace(/\D/g, "");
  if (!normalizedName || !phoneDigits) return null;

  return (
    examCandidates.find((candidate) => {
      return (
        candidate.name === normalizedName &&
        (phoneDigits === candidate.phoneLast4 ||
          phoneDigits.endsWith(candidate.phoneLast4))
      );
    }) ?? null
  );
}

function getVisibleCandidateName(
  candidate: ExamCandidate,
  viewerCandidate: ExamCandidate | null
) {
  return candidate.id === viewerCandidate?.id
    ? candidate.name
    : maskCandidateName(candidate.name);
}

function maskCandidateName(name: string) {
  const characters = Array.from(name.trim());
  if (characters.length === 0) return "候选人";
  return `${characters[0]}xx`;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("zh-CN").format(value);
}
