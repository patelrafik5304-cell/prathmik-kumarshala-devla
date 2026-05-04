import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Staff from '@/models/Staff';

export async function GET() {
  await connectDB();
  const items = await Staff.find().sort({ createdAt: -1 });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();
  const item = await Staff.create(body);
  return NextResponse.json(item, { status: 201 });
}

export async function PUT(req: NextRequest) {
  await connectDB();
  const { id, ...data } = await req.json();
  const item = await Staff.findByIdAndUpdate(id, data, { new: true });
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(item);
}

export async function DELETE(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  await Staff.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
