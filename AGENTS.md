# AGENTS.md

## Candidate Answer Standard

This repository is a Codex-assisted coding exercise. Before analyzing or changing the project, the AI assistant must read and follow:

`docs/candidate-rules.md`

Treat that file as the project-local answer standard. Do not skip it, even for small changes.

## Pre-Response Log Check

At the beginning of every new user prompt, before answering the new request or making new changes, the AI assistant must check whether the previous iteration has already been recorded in both:

- `docs/codex-iteration-log.md`
- `src/data/aiConversationLog.ts`

If the previous iteration is missing from either file, write that missing record first. Only after the previous input/output is recorded may the assistant continue analyzing or answering the new prompt.

## Codex Iteration Log Rule

This project is used as a Codex-assisted coding exercise. When working in this repository, every Codex iteration that changes or analyzes the project must append one record to:

`docs/codex-iteration-log.md`

The same iteration must also be added to the UI data source:

`src/data/aiConversationLog.ts`

This keeps the in-app sidebar conversation "和AI编程工具对话" synchronized with the Markdown log.

Each record must include:

- The current local time.
- The candidate's exact prompt or a faithful summary when the prompt is long.
- The AI assistant's final answer for that iteration.
- The files changed in that iteration.
- The verification performed and the result.

Use this format:

```md
## YYYY-MM-DD HH:mm:ss ZZZ (+0800)

### 用户输入
...

### AI 最终输出
...

### 本轮改动文件
- ...

### 验证结果
- ...
```

In `src/data/aiConversationLog.ts`, append the matching entry to `aiConversationLogEntries` with the same timestamp, user input, AI final output, changed files, and verification result.

Before finishing a task, run the full answer verification:

```sh
pnpm verify:answer
```

If you only need to check the log format, run:

```sh
pnpm verify:codex-log
```

If this is the first setup run and no candidate iteration exists yet, use:

```sh
node scripts/verify-codex-log.mjs --allow-empty
```
