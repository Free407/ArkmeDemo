export type ExamCandidateStatus = "not_started" | "active" | "submitted";
export type ExamSyncHealth = "healthy" | "warning" | "offline";

export type ExamIteration = {
  id: string;
  occurredAt: string;
  userInput: string;
  aiOutput: string;
  changedFiles: string[];
  verification: string[];
};

export type ExamCandidate = {
  id: string;
  name: string;
  phoneMasked: string;
  phoneLast4: string;
  roleTarget: string;
  status: ExamCandidateStatus;
  bindStatus: "已绑定" | "未绑定";
  latestInputAt: string | null;
  inputCount: number;
  inputCharacters: number;
  syncHealth: ExamSyncHealth;
  resumePublic: boolean;
  aiContextPublic: boolean;
  resume: {
    fileName: string;
    importedAt: string;
    summary: string;
    highlights: string[];
    experience: string[];
  };
  iterations: ExamIteration[];
  syncEvents: Array<{
    id: string;
    occurredAt: string;
    status: "success" | "pending" | "failed";
    description: string;
  }>;
  auditEvents: Array<{
    id: string;
    occurredAt: string;
    description: string;
  }>;
};

export const examCandidates: ExamCandidate[] = [
  {
    id: "cand-zhang-san",
    name: "张三",
    phoneMasked: "138****1234",
    phoneLast4: "1234",
    roleTarget: "前端工程师",
    status: "active",
    bindStatus: "已绑定",
    latestInputAt: "2026-05-12 05:38",
    inputCount: 12,
    inputCharacters: 4280,
    syncHealth: "healthy",
    resumePublic: true,
    aiContextPublic: false,
    resume: {
      fileName: "张三-前端工程师.pdf",
      importedAt: "2026-05-11 21:16",
      summary:
        "5 年前端经验，熟悉 React、TypeScript 和移动端 Web 体验优化，最近两段经历都围绕 AI 产品和内容型工具。",
      highlights: [
        "主导过移动端 H5 工作台重构，关注首屏、交互响应和复杂状态管理。",
        "有 AI 辅助开发经验，能把产品需求拆成可验证的小迭代。",
        "对候选人题目中的记录、安排、洞见模块有较完整的产品理解。",
      ],
      experience: [
        "2023-2026 即刻云：负责 React 移动端应用和后台运营系统。",
        "2020-2023 明河科技：参与低代码页面搭建器和组件库建设。",
      ],
    },
    iterations: [
      {
        id: "iter-001",
        occurredAt: "2026-05-12 04:52",
        userInput:
          "请先阅读 AGENTS.md 和 docs/candidate-rules.md，然后按其中的答题规范完成后续需求。",
        aiOutput:
          "已阅读项目规范，确认每轮需要先检查日志、再分析需求、修改代码并同步记录到 Markdown 和 UI 数据源。",
        changedFiles: [],
        verification: ["已阅读 AGENTS.md", "已阅读 docs/candidate-rules.md"],
      },
      {
        id: "iter-002",
        occurredAt: "2026-05-12 05:08",
        userInput:
          "新增安排模块入口，用户可以在首页输入一句安排事项，系统需要沉淀成待办。",
        aiOutput:
          "已完成安排模块入口、首页发送后的待办沉淀，以及侧边栏入口展示。实现保持移动端优先布局。",
        changedFiles: ["src/pages/Home.tsx", "src/types/record.ts"],
        verification: ["pnpm lint 通过", "pnpm build 通过"],
      },
      {
        id: "iter-003",
        occurredAt: "2026-05-12 05:38",
        userInput:
          "安排详情里需要能看到原始输入，并且能标记完成，完成后首页不再突出显示。",
        aiOutput:
          "已补充安排详情页、完成状态切换和首页弱化展示逻辑，同时更新迭代记录。",
        changedFiles: [
          "src/pages/Home.tsx",
          "src/components/RecordFullDetailScreen.tsx",
          "src/data/aiConversationLog.ts",
        ],
        verification: ["pnpm lint 通过", "pnpm build 通过", "pnpm verify:answer 通过"],
      },
    ],
    syncEvents: [
      {
        id: "sync-001",
        occurredAt: "2026-05-12 05:38",
        status: "success",
        description: "上传 1 条新增迭代，解析 3 个改动文件。",
      },
      {
        id: "sync-002",
        occurredAt: "2026-05-12 05:12",
        status: "success",
        description: "候选人本地 session 绑定成功。",
      },
    ],
    auditEvents: [
      {
        id: "audit-001",
        occurredAt: "2026-05-12 05:17",
        description: "候选人开启简历对其他候选人可见。",
      },
      {
        id: "audit-002",
        occurredAt: "2026-05-12 05:19",
        description: "候选人保持 AI 编程上下文仅官方可见。",
      },
    ],
  },
  {
    id: "cand-li-si",
    name: "李四",
    phoneMasked: "186****6688",
    phoneLast4: "6688",
    roleTarget: "全栈工程师",
    status: "active",
    bindStatus: "已绑定",
    latestInputAt: "2026-05-12 05:21",
    inputCount: 5,
    inputCharacters: 1890,
    syncHealth: "warning",
    resumePublic: false,
    aiContextPublic: true,
    resume: {
      fileName: "李四-fullstack.docx",
      importedAt: "2026-05-11 20:44",
      summary:
        "偏全栈方向，熟悉 Node.js、React 和 PostgreSQL，有从 0 到 1 搭建内部系统的经验。",
      highlights: [
        "对数据模型和服务端接口拆分较敏感。",
        "有部署和 CI 经验，能独立排查线上构建问题。",
        "候选过程中主动提出了同步脚本的失败重试边界。",
      ],
      experience: [
        "2022-2026 远川软件：负责 SaaS 管理后台和 API 服务。",
        "2019-2022 北湾互动：负责活动页和数据看板。",
      ],
    },
    iterations: [
      {
        id: "iter-101",
        occurredAt: "2026-05-12 04:59",
        userInput: "先读规范，然后帮我理解当前项目结构。",
        aiOutput: "已梳理首页、侧边栏、快记详情和本地日志机制。",
        changedFiles: [],
        verification: ["已阅读规范", "已检查 src/pages/Home.tsx"],
      },
      {
        id: "iter-102",
        occurredAt: "2026-05-12 05:21",
        userInput: "我想先做数据结构，再做页面。",
        aiOutput: "已给出数据结构方案，等待确认后实现。",
        changedFiles: ["docs/codex-iteration-log.md"],
        verification: ["方案阶段，未修改业务代码"],
      },
    ],
    syncEvents: [
      {
        id: "sync-101",
        occurredAt: "2026-05-12 05:22",
        status: "pending",
        description: "最近一次上传等待服务端解析验证结果。",
      },
      {
        id: "sync-102",
        occurredAt: "2026-05-12 05:02",
        status: "success",
        description: "上传初始化记录。",
      },
    ],
    auditEvents: [
      {
        id: "audit-101",
        occurredAt: "2026-05-12 05:04",
        description: "候选人开启 AI 编程上下文对其他候选人可见。",
      },
    ],
  },
  {
    id: "cand-wang-wu",
    name: "王五",
    phoneMasked: "159****0909",
    phoneLast4: "0909",
    roleTarget: "前端实习生",
    status: "not_started",
    bindStatus: "未绑定",
    latestInputAt: null,
    inputCount: 0,
    inputCharacters: 0,
    syncHealth: "offline",
    resumePublic: false,
    aiContextPublic: false,
    resume: {
      fileName: "王五-前端实习.pdf",
      importedAt: "2026-05-11 22:03",
      summary:
        "应届候选人，项目经验集中在 React 课程项目和个人效率工具，对移动端 UI 有基础理解。",
      highlights: [
        "熟悉 React 基础和 TypeScript 类型定义。",
        "有个人项目复盘，能说明组件拆分思路。",
        "尚未开始本次 Codex 答题。",
      ],
      experience: [
        "2025 校园项目：个人知识记录 Web App。",
        "2024 课程项目：移动端任务清单。",
      ],
    },
    iterations: [],
    syncEvents: [
      {
        id: "sync-201",
        occurredAt: "2026-05-11 22:04",
        status: "success",
        description: "简历导入完成，等待候选人绑定。",
      },
    ],
    auditEvents: [],
  },
];
