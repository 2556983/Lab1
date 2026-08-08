# Running It

## Requirements

- Node.js **v20 or later** (developed and tested against v22.22.2). `better-sqlite3` installs a prebuilt native binary for common platforms; if none is available for your platform it will compile from source, for which you'll also need a C++ toolchain (Xcode Command Line Tools on macOS, `build-essential` on Debian/Ubuntu, or the "Desktop development with C++" workload on Windows).
- npm (ships with Node).

No SQLite installation is required — `better-sqlite3` bundles SQLite itself.

## From a clean clone

```bash
git clone <this-repository-url>
cd todo-app
npm install
npm run build
npm run start
```

Then open **http://localhost:3000**.

The SQLite database file is created automatically on first run at `data/todo.db` (the `data/` directory is created if it doesn't exist). Stopping and restarting the server does not touch this file, so all tasks persist across restarts.

### Development mode

For local development with hot reload instead of a production build:

```bash
npm install
npm run dev
```

## Running the tests

```bash
npm test
```

This runs `vitest run`, which executes `tests/tasks.test.js` against a fresh in-memory SQLite database created for each test (`getDb(':memory:')`) — it never touches `data/todo.db`, so running the tests is safe at any time and requires no setup beyond `npm install`.

## Resetting local data

To start over with an empty task list, stop the server and delete the `data/` directory:

```bash
rm -rf data
```
