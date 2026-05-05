import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { username, password, role } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }

    if (username === '242105010083' && password === '10083') {
      return NextResponse.json({
        success: true,
        role: 'admin',
        username: '242105010083',
      });
    }

    const db = getAdminDb();

    // Check student
    const studentDoc = await db.collection('students')
      .where('username', '==', username)
      .get();

    if (!studentDoc.empty) {
      const studentData = studentDoc.docs[0].data();
      let isMatch = false;
      
      // Try bcrypt comparison first (for hashed passwords)
      if (studentData.password && studentData.password.startsWith('$2')) {
        isMatch = await bcrypt.compare(password, studentData.password);
      } else {
        // Fallback to plain text comparison (for existing students with unhashed passwords)
        isMatch = studentData.password === password;
      }
      
      if (isMatch) {
        return NextResponse.json({
          success: true,
          role: 'student',
          username: studentData.username,
          name: studentData.name,
          class: studentData.class,
        });
      }
    }

    // Check staff
    const staffDoc = await db.collection('staff')
      .where('username', '==', username)
      .get();

    if (!staffDoc.empty) {
      const staffData = staffDoc.docs[0].data();
      const isMatch = await bcrypt.compare(password, staffData.password || '');
      if (isMatch) {
        return NextResponse.json({
          success: true,
          role: 'staff',
          username: staffData.username,
          name: staffData.name,
        });
      }
    }

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
