import { NextResponse } from 'next/server';
import { getDb, archiveTask } from '@/lib/db';

export async function POST(request, { params }) {
  const db = getDb();
  try {
    const task = archiveTask(db, params.id);
    return NextResponse.json(task);
  } catch (err) {
    const status = err.message === 'Task not found' ? 404 : 400;
    return NextResponse.json({ error: err.message }, { status });
  }
}
