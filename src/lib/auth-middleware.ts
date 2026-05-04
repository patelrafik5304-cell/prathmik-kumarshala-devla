import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from './firebase-admin';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    uid: string;
    email: string;
    role: string;
  };
}

export async function verifyFirebaseToken(req: NextRequest): Promise<{ uid: string; email: string; role: string } | null> {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return null;

    const token = authHeader.split('Bearer ')[1];
    const decoded = await getAdminAuth().verifyIdToken(token);

    return {
      uid: decoded.uid,
      email: decoded.email || '',
      role: (decoded.role as string) || 'student',
    };
  } catch {
    return null;
  }
}

export function requireAuth(req: NextRequest): { user: { uid: string; email: string; role: string } } | NextResponse {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return { user: { uid: '', email: '', role: '' } };
}

export function requireAdmin(req: NextRequest): NextResponse | null {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return null;
}
