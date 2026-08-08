const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const VALID_STATUSES = ['todo', 'in_progress', 'complete'];
const VALID_SORTS = { topic: 'topic', status: 'status', due_date: 'due_date' };

let defaultInstance = null;

/**
 * Open (or create) a SQLite database at the given path and ensure the
 * schema exists. Pass an explicit path for tests so they never touch the
 * developer's own data file.
 */
function getDb(dbPath) {
  const targetPath = dbPath || process.env.DB_PATH || path.join(process.cwd(), 'data', 'todo.db');

  if (targetPath === ':memory:') {
    return openAndInit(targetPath);
  }

  const dir = path.dirname(targetPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  // Cache one instance per process for the default path so the API routes
  // reuse a single connection instead of reopening the file per request.
  if (!dbPath || dbPath === defaultInstance?.__path) {
    if (defaultInstance) return defaultInstance;
    const db = openAndInit(targetPath);
    db.__path = targetPath;
    defaultInstance = db;
    return db;
  }

  return openAndInit(targetPath);
}

function openAndInit(targetPath) {
  const db = new Database(targetPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      title         TEXT NOT NULL,
      description   TEXT,
      due_date      TEXT,
      topic         TEXT,
      status        TEXT NOT NULL DEFAULT 'todo'
                    CHECK (status IN ('todo', 'in_progress', 'complete')),
      archived_at   TEXT,
      created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  return db;
}

function closeDb(db) {
  if (db === defaultInstance) defaultInstance = null;
  db.close();
}

/**
 * "overdue" is never stored. It's derived at read time from due_date and
 * status so it can never drift out of sync with the two facts it depends on.
 */
function withDerivedFields(row) {
  const today = new Date().toISOString().slice(0, 10);
  const overdue = Boolean(
    !row.archived_at && row.status !== 'complete' && row.due_date && row.due_date < today
  );
  return { ...row, overdue, archived: Boolean(row.archived_at) };
}

function createTask(db, { title, description, due_date, topic } = {}) {
  if (!title || !title.trim()) {
    throw new Error('Title is required');
  }
  const stmt = db.prepare(`
    INSERT INTO tasks (title, description, due_date, topic, status)
    VALUES (?, ?, ?, ?, 'todo')
  `);
  const info = stmt.run(title.trim(), description || null, due_date || null, topic || null);
  return getTaskById(db, info.lastInsertRowid);
}

function getTaskById(db, id) {
  const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  return row ? withDerivedFields(row) : null;
}

function getTasks(db, { sortBy = 'due_date', includeArchived = false } = {}) {
  const column = VALID_SORTS[sortBy] || 'due_date';
  const where = includeArchived ? '' : 'WHERE archived_at IS NULL';
  // "col IS NULL" first pushes tasks with no value for the sort column to
  // the end instead of SQLite's default of sorting NULLs first.
  const rows = db
    .prepare(`SELECT * FROM tasks ${where} ORDER BY ${column} IS NULL, ${column} ASC, id ASC`)
    .all();
  return rows.map(withDerivedFields);
}

function updateTask(db, id, updates = {}) {
  const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  if (!existing) throw new Error('Task not found');

  if (updates.status !== undefined && !VALID_STATUSES.includes(updates.status)) {
    throw new Error(`Invalid status: ${updates.status}`);
  }
  if (updates.title !== undefined && !updates.title.trim()) {
    throw new Error('Title cannot be empty');
  }

  const merged = {
    title: updates.title !== undefined ? updates.title.trim() : existing.title,
    description: updates.description !== undefined ? updates.description : existing.description,
    due_date: updates.due_date !== undefined ? updates.due_date : existing.due_date,
    topic: updates.topic !== undefined ? updates.topic : existing.topic,
    status: updates.status !== undefined ? updates.status : existing.status
  };

  db.prepare(`
    UPDATE tasks SET title = ?, description = ?, due_date = ?, topic = ?, status = ?
    WHERE id = ?
  `).run(merged.title, merged.description, merged.due_date, merged.topic, merged.status, id);

  return getTaskById(db, id);
}

function archiveTask(db, id) {
  const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  if (!existing) throw new Error('Task not found');
  db.prepare(`UPDATE tasks SET archived_at = datetime('now') WHERE id = ?`).run(id);
  return getTaskById(db, id);
}

module.exports = {
  getDb,
  closeDb,
  createTask,
  getTaskById,
  getTasks,
  updateTask,
  archiveTask,
  VALID_STATUSES
};
