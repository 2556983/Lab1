# Third-Party Code

Packages installed beyond what a bare Node.js setup provides, and why each was chosen.

| Package | Role | Why this one |
|---|---|---|
| `next` | Application framework — pages, routing, and the API route handlers | Gives a single project both the UI and the backend API without wiring up a separate server, and its file-based routing keeps the API surface (`/api/tasks`, `/api/tasks/[id]`) easy to map straight onto the four CRUD-ish operations the brief needs. |
| `react` / `react-dom` | UI rendering | Required peer dependency of Next.js for building the interface; used directly for the task list, form, and inline edit state. |
| `better-sqlite3` | SQLite driver | Synchronous API, which matches this app's local single-user, single-process usage pattern and avoids the callback/Promise ceremony of async drivers for what are always fast local disk reads. It's also one of the most actively maintained native SQLite bindings for Node, with no separate server process to install — fitting the "downloads and runs locally" brief. |
| `vitest` (dev) | Test runner | Runs directly against the CommonJS `lib/db.js` module with no extra transpilation setup, is fast, and has a Jest-compatible API (`describe`/`it`/`expect`) that needed no extra explanation in this doc. |

No ORM was used. The schema is small enough (one table) that raw SQL in `lib/db.js` is easier to audit than a generated query layer, and it keeps the derived-`overdue` logic and the archive-as-timestamp design visible in one place rather than hidden behind ORM conventions.
