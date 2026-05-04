import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Gallery from '@/models/Gallery';

export const runtime = 'nodejs';

export async function GET() {
  try {
    await connectDB();
    const items = await Gallery.find().sort({ createdAt: -1 });
    return NextResponse.json(items);
  } catch (e) {
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    console.log('[Gallery POST] Content-Type:', contentType);

    await connectDB();

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('image') as File | null;
      const title = formData.get('title') as string || '';
      const category = formData.get('category') as string || 'Events';
      const description = formData.get('description') as string || '';

      console.log('[Gallery POST] File:', file?.name, file?.size, file?.type);
      console.log('[Gallery POST] Title:', title, 'Category:', category);

      if (!file) {
        return NextResponse.json({ error: 'No image provided' }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const uint8 = new Uint8Array(bytes);
      let base64 = '';
      const chunkSize = 8192;
      for (let i = 0; i < uint8.length; i += chunkSize) {
        base64 += String.fromCharCode(...uint8.subarray(i, i + chunkSize));
      }
      base64 = btoa(base64);
      const dataUrl = `data:${file.type};base64,${base64}`;
      console.log('[Gallery POST] Base64 length:', dataUrl.length);

      const item = await Gallery.create({
        title,
        category,
        description,
        imageUrl: dataUrl,
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
      });

      console.log('[Gallery POST] Created:', item._id);
      return NextResponse.json(item, { status: 201 });
    } else {
      const body = await req.json();
      console.log('[Gallery POST] JSON body:', JSON.stringify(body).slice(0, 200));
      const item = await Gallery.create({
        ...body,
        createdAt: new Date().toISOString(),
      });
      return NextResponse.json(item, { status: 201 });
    }
  } catch (e: any) {
    console.error('[Gallery POST] Error:', e);
    console.error('[Gallery POST] Stack:', e.stack);
    return NextResponse.json({ error: e.message || 'Failed to upload' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const { id, ...data } = await req.json();
    const item = await Gallery.findByIdAndUpdate(id, data, { new: true });
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(item);
  } catch (e) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    await Gallery.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
