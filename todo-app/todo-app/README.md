# Ledger — a local todo app

A local-first todo application built with Next.js and SQLite. There are no user accounts and no deployment — you download it, run it with Node, and it serves the one person using this machine.

## Quick start

Requires **Node.js v20+**.

```bash
npm install
npm run build
npm run start
```

Open **http://localhost:3000**. Data is stored in `data/todo.db` and persists across restarts.

Full setup and troubleshooting notes: [`docs/running-it.md`](docs/running-it.md).

## Features

- Create, edit, and archive tasks (title, description, due date, topic).
- Archived tasks are never deleted — they stay viewable via the "Show archived" toggle.
- Three fixed statuses: Todo, In-Progress, Complete.
- Sort the task list by topic, status, or due date.
- Overdue tasks are flagged visually; "overdue" is derived from the due date, not a status.

## Documentation

- [`docs/third-party-code.md`](docs/third-party-code.md) — installed packages and why.
- [`docs/database-design.md`](docs/database-design.md) — schema and design decisions.
- [`docs/running-it.md`](docs/running-it.md) — install, run, and test instructions.

## Testing

```bash
npm test
```

Runs a Vitest suite covering task creation, editing, archiving, sorting, and the derived overdue rule, against a throwaway in-memory database.
