# Arkme Demo

这是一个用于候选人笔试的移动端前端 Demo。候选人需要克隆本项目后，在 Codex 客户端中根据给定需求继续迭代。

## 候选人答题流程

候选人克隆项目后，请用 Codex 客户端打开本项目，并先输入：

```text
请先阅读 AGENTS.md 和 docs/candidate-rules.md，然后按其中的答题规范完成后续需求。
```

`docs/candidate-rules.md` 是本项目内的答题标准。候选人不需要额外安装本地 Skill，但需要让 Codex 按该文件完成需求分析、代码修改、验证和记录。

## Codex 迭代记录要求

候选人每次在 AI 编程工具中输入新的需求后，AI 助手应先检查上一轮输入输出是否已经同步写入 Markdown 日志和 UI 数据源。若缺失，应先补齐上一轮记录，再继续处理新的需求。

候选人每次使用 Codex 对项目进行一次需求分析、代码修改或验证后，都需要让 Codex 把本轮过程追加写入：

```text
docs/codex-iteration-log.md
src/data/aiConversationLog.ts
```

每条记录必须包含：

- 时间
- 候选人在 Codex 中输入的内容
- AI 最终输出的结果
- 本轮改动文件
- 验证结果

其中 `docs/codex-iteration-log.md` 用于源码审阅，`src/data/aiConversationLog.ts` 用于应用侧边栏里的“和AI编程工具对话”展示。

最终提交 GitHub 前，请运行：

```sh
pnpm verify:answer
```

面试官会结合最终代码、Git 提交历史和 `docs/codex-iteration-log.md` 判断候选人使用 AI 迭代项目的过程。
