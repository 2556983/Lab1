'use client';

import { useEffect, useState, useCallback } from 'react';
import TaskForm from '@/components/TaskForm';
import TaskRow from '@/components/TaskRow';

const SORTS = [
  { key: 'due_date', label: 'Due date' },
  { key: 'topic', label: 'Topic' },
  { key: 'status', label: 'Status' }
];

export default function Page() {
  const [tasks, setTasks] = useState([]);
  const [sortBy, setSortBy] = useState('due_date');
  const [showArchived, setShowArchived] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const params = new URLSearchParams({ sortBy, includeArchived: String(showArchived) });
    const res = await fetch(`/api/tasks?${params}`);
    const data = await res.json();
    setTasks(data);
    setLoading(false);
  }, [sortBy, showArchived]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(form) {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.error);
    }
    await load();
  }

  async function handleUpdate(id, updates) {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.error);
    }
    await load();
  }

  async function handleArchive(id) {
    await fetch(`/api/tasks/${id}/archive`, { method: 'POST' });
    await load();
  }

  return (
    <main className="page">
      <div className="masthead">
        <h1>Ledger</h1>
        <p>A local todo list. Nothing here leaves this machine.</p>
      </div>

      <TaskForm onCreate={handleCreate} />

      <div className="sort-bar">
        <span className="label">Sort by</span>
        {SORTS.map((s) => (
          <button
            key={s.key}
            className={`sort-tab${sortBy === s.key ? ' active' : ''}`}
            onClick={() => setSortBy(s.key)}
          >
            {s.label}
          </button>
        ))}
        <label className="archived-toggle">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
          />
          Show archived
        </label>
      </div>

      <div className="ledger">
        {loading && <div className="ledger__empty">Loading…</div>}
        {!loading && tasks.length === 0 && (
          <div className="ledger__empty">No tasks yet. Add one above.</div>
        )}
        {tasks.map((task) => (
          <TaskRow key={task.id} task={task} onUpdate={handleUpdate} onArchive={handleArchive} />
        ))}
      </div>
    </main>
  );
}
