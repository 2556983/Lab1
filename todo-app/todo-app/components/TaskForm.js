'use client';

import { useState } from 'react';

const EMPTY = { title: '', description: '', due_date: '', topic: '' };

export default function TaskForm({ onCreate }) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (!form.title.trim()) {
      setError('A task needs a title.');
      return;
    }
    setSubmitting(true);
    try {
      await onCreate(form);
      setForm(EMPTY);
    } catch (err) {
      setError(err.message || 'Could not create task.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <div className="task-form__row">
        <div>
          <label htmlFor="title">Title</label>
          <input
            id="title"
            value={form.title}
            onChange={handleChange('title')}
            placeholder="Write the lab report"
          />
        </div>
      </div>

      <div className="task-form__row" style={{ marginTop: 12 }}>
        <div>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={form.description}
            onChange={handleChange('description')}
            placeholder="Optional detail"
          />
        </div>
      </div>

      <div className="task-form__row task-form__row--split" style={{ marginTop: 12 }}>
        <div>
          <label htmlFor="topic">Topic</label>
          <input
            id="topic"
            value={form.topic}
            onChange={handleChange('topic')}
            placeholder="e.g. COMS3011A"
          />
        </div>
        <div>
          <label htmlFor="due_date">Due date</label>
          <input
            id="due_date"
            type="date"
            value={form.due_date}
            onChange={handleChange('due_date')}
          />
        </div>
      </div>

      <button className="task-form__submit" type="submit" disabled={submitting}>
        {submitting ? 'Adding…' : 'Add task'}
      </button>
      {error && <div className="task-form__error">{error}</div>}
    </form>
  );
}
