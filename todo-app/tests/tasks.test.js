import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getDb, createTask, getTasks, updateTask, archiveTask, closeDb } from '../lib/db.js';

// Each test gets its own throwaway in-memory database, so tests never touch
// the developer's real data file and never leak state between each other.
let db;

beforeEach(() => {
  db = getDb(':memory:');
});

afterEach(() => {
  closeDb(db);
});

function iso(daysFromToday) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromToday);
  return d.toISOString().slice(0, 10);
}

describe('creating and reading tasks', () => {
  it('creates a task with all four fields and returns it with defaults applied', () => {
    const task = createTask(db, {
      title: 'Write lab report',
      description: 'Cover the SQLite schema',
      due_date: iso(5),
      topic: 'COMS3011A'
    });

    expect(task.title).toBe('Write lab report');
    expect(task.status).toBe('todo');
    expect(task.archived).toBe(false);
    expect(task.overdue).toBe(false);
  });

  it('rejects a task with no title', () => {
    expect(() => createTask(db, { title: '   ' })).toThrow(/title/i);
  });
});

describe('the overdue rule', () => {
  it('flags a task whose due date has passed and is not complete', () => {
    const task = createTask(db, { title: 'Late thing', due_date: iso(-3) });
    expect(task.overdue).toBe(true);
  });

  it('does not flag a task with no due date', () => {
    const task = createTask(db, { title: 'No deadline' });
    expect(task.overdue).toBe(false);
  });

  it('stops flagging a task as overdue once it is marked complete', () => {
    const task = createTask(db, { title: 'Late but done', due_date: iso(-3) });
    const completed = updateTask(db, task.id, { status: 'complete' });
    expect(completed.overdue).toBe(false);
  });

  it('rejects a status outside the three fixed values', () => {
    const task = createTask(db, { title: 'Whatever' });
    expect(() => updateTask(db, task.id, { status: 'overdue' })).toThrow(/invalid status/i);
  });
});

describe('archiving', () => {
  it('removes an archived task from the default (active) list but keeps it viewable', () => {
    const task = createTask(db, { title: 'To be archived' });
    archiveTask(db, task.id);

    const active = getTasks(db, {});
    const all = getTasks(db, { includeArchived: true });

    expect(active.find((t) => t.id === task.id)).toBeUndefined();
    expect(all.find((t) => t.id === task.id)).toBeDefined();
    expect(all.find((t) => t.id === task.id).archived).toBe(true);
  });

  it('never flags an archived task as overdue even if its due date has passed', () => {
    const task = createTask(db, { title: 'Overdue then archived', due_date: iso(-10) });
    archiveTask(db, task.id);
    const [archived] = getTasks(db, { includeArchived: true }).filter((t) => t.id === task.id);
    expect(archived.overdue).toBe(false);
  });
});

describe('sorting', () => {
  it('sorts tasks by due date ascending', () => {
    createTask(db, { title: 'Later', due_date: iso(10) });
    createTask(db, { title: 'Sooner', due_date: iso(1) });
    createTask(db, { title: 'No date' });

    const rows = getTasks(db, { sortBy: 'due_date' });
    expect(rows.map((t) => t.title)).toEqual(['Sooner', 'Later', 'No date']);
  });

  it('sorts tasks by topic alphabetically', () => {
    createTask(db, { title: 'B task', topic: 'Zoology' });
    createTask(db, { title: 'A task', topic: 'Algebra' });

    const rows = getTasks(db, { sortBy: 'topic' });
    expect(rows.map((t) => t.title)).toEqual(['A task', 'B task']);
  });

  it('sorts tasks by status', () => {
    const t1 = createTask(db, { title: 'One' });
    const t2 = createTask(db, { title: 'Two' });
    updateTask(db, t2.id, { status: 'complete' });

    const rows = getTasks(db, { sortBy: 'status' });
    // 'complete' < 'in_progress' < 'todo' alphabetically, so the completed
    // task should sort first.
    expect(rows[0].title).toBe('Two');
  });
});

describe('editing', () => {
  it('persists an edit to an existing task', () => {
    const task = createTask(db, { title: 'Original title' });
    const updated = updateTask(db, task.id, { title: 'Edited title', topic: 'New topic' });

    expect(updated.title).toBe('Edited title');
    expect(updated.topic).toBe('New topic');

    const reloaded = getTasks(db, { includeArchived: true }).find((t) => t.id === task.id);
    expect(reloaded.title).toBe('Edited title');
  });

  it('throws when editing a task that does not exist', () => {
    expect(() => updateTask(db, 9999, { title: 'Ghost' })).toThrow(/not found/i);
  });
});
