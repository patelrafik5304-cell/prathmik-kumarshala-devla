import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Announcement from '@/models/Announcement';

export async function GET() {
  try {
    await connectDB();
  } catch (e) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }
  const items = await Announcement.find().sort({ createdAt: -1 });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
  } catch (e) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }
  const body = await req.json();
  const item = await Announcement.create(body);
  return NextResponse.json(item, { status: 201 });
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
  } catch (e) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }
  const { id, ...data } = await req.json();
  const item = await Announcement.findByIdAndUpdate(id, data, { new: true });
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(item);
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
  await Announcement.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
