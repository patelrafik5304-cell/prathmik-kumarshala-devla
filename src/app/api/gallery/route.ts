import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Gallery from '@/models/Gallery';

export async function GET() {
  await connectDB();
  const items = await Gallery.find().sort({ createdAt: -1 });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();
  const item = await Gallery.create(body);
  return NextResponse.json(item, { status: 201 });
}

export async function PUT(req: NextRequest) {
  await connectDB();
  const { id, ...data } = await req.json();
  const item = await Gallery.findByIdAndUpdate(id, data, { new: true });
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(item);
}

export async function DELETE(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  await Gallery.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
