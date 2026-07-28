'use client';

import { useState } from 'react';

const STATUS_LABEL = {
  todo: 'Todo',
  in_progress: 'In progress',
  complete: 'Complete'
};

export default function TaskRow({ task, onUpdate, onArchive }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    title: task.title,
    description: task.description || '',
    due_date: task.due_date || '',
    topic: task.topic || ''
  });

  async function saveEdit(e) {
    e.preventDefault();
    await onUpdate(task.id, draft);
    setEditing(false);
  }

  async function changeStatus(e) {
    await onUpdate(task.id, { status: e.target.value });
  }

  if (editing) {
    return (
      <div className="task-row">
        <form className="task-row__edit-form" onSubmit={saveEdit}>
          <input
            value={draft.title}
            onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
          />
          <textarea
            value={draft.description}
            onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={draft.topic}
              onChange={(e) => setDraft((d) => ({ ...d, topic: e.target.value }))}
              placeholder="Topic"
            />
            <input
              type="date"
              value={draft.due_date}
              onChange={(e) => setDraft((d) => ({ ...d, due_date: e.target.value }))}
            />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="link-btn" type="submit">Save</button>
            <button className="link-btn" type="button" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className={`task-row${task.archived ? ' archived' : ''}`}>
      <div className="task-row__main">
        <div className="task-row__title-line">
          <span className="task-row__title">{task.title}</span>
          {task.topic && <span className="task-row__topic">{task.topic}</span>}
        </div>
        {task.description && <div className="task-row__desc">{task.description}</div>}
        <div className="task-row__meta">
          <span className={`status-pill ${task.status}`}>{STATUS_LABEL[task.status]}</span>
          {task.due_date && <span className="due-date">due {task.due_date}</span>}
          {task.overdue && <span className="overdue-flag">overdue</span>}
        </div>
      </div>
      {!task.archived && (
        <div className="task-row__actions">
          <select value={task.status} onChange={changeStatus} aria-label="Change status">
            <option value="todo">Todo</option>
            <option value="in_progress">In progress</option>
            <option value="complete">Complete</option>
          </select>
          <button type="button" onClick={() => setEditing(true)}>Edit</button>
          <button type="button" className="archive" onClick={() => onArchive(task.id)}>
            Archive
          </button>
        </div>
      )}
    </div>
  );
}
