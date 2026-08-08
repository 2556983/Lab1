import { NextResponse } from 'next/server';
import { getDb, updateTask } from '@/lib/db';

export async function PATCH(request, { params }) {
  const body = await request.json();
  const db = getDb();
  try {
    const task = updateTask(db, params.id, body);
    return NextResponse.json(task);
  } catch (err) {
    const status = err.message === 'Task not found' ? 404 : 400;
    return NextResponse.json({ error: err.message }, { status });
  }
}
