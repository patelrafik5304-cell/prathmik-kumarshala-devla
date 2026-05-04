import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Result from '@/models/Result';

export async function GET() {
  try {
    await connectDB();
  } catch (e) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }
  const results = await Result.find().sort({ createdAt: -1 });
  return NextResponse.json(results);
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
  } catch (e) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }
  const body = await req.json();
  const results = Array.isArray(body)
    ? await Result.insertMany(body)
    : [await Result.create(body)];
  return NextResponse.json(results, { status: 201 });
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
  } catch (e) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }
  const { id, ...data } = await req.json();
  const result = await Result.findByIdAndUpdate(id, data, { new: true });
  if (!result) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(result);
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
  } catch (e) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  await Result.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
