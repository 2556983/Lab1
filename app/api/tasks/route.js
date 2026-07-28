import { NextResponse } from 'next/server';
import { getDb, getTasks, createTask } from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const sortBy = searchParams.get('sortBy') || 'due_date';
  const includeArchived = searchParams.get('includeArchived') === 'true';

  const db = getDb();
  const tasks = getTasks(db, { sortBy, includeArchived });
  return NextResponse.json(tasks);
}

export async function POST(request) {
  const body = await request.json();
  const db = getDb();
  try {
    const task = createTask(db, body);
    return NextResponse.json(task, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
