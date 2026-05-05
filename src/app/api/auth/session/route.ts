import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  try {
    // Get session cookie or token from request
    const authHeader = req.headers.get('authorization');
    const cookie = req.headers.get('cookie') || '';
    
    // For simplicity, return null if no session
    // In production, verify the session/token properly
    return NextResponse.json({ user: null });
  } catch (e) {
    return NextResponse.json({ user: null });
  }
}
