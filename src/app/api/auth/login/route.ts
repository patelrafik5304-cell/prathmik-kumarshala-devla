import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password, role } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    // In production, use Firebase Admin SDK to verify
    // For now, return success with demo credentials
    if ((email === 'admin@school.com' || email === 'admin') && password === 'admin123') {
      return NextResponse.json({
        success: true,
        role: 'admin',
        user: { email: 'admin@school.com', name: 'Admin User', role: 'admin' },
      });
    } else if ((email === 'student@school.com' || email === 'student') && password === 'student123') {
      return NextResponse.json({
        success: true,
        role: 'student',
        user: { email: 'student@school.com', name: 'John Doe', role: 'student' },
      });
    }

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
