import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import bcrypt from 'bcryptjs';

function generateStudentId(count: number): string {
  return `STU${String(count).padStart(4, '0')}`;
}

function generateUsername(name: string, count: number): string {
  const prefix = name.toLowerCase().replace(/[^a-z]/g, '').slice(0, 4);
  return `${prefix}${String(count).padStart(3, '0')}`;
}

function generatePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

function generateHashedPassword(): { plain: string; hashed: string } {
  const plain = generatePassword();
  const hashed = bcrypt.hashSync(plain, 10);
  return { plain, hashed };
}

export async function POST(req: NextRequest) {
  try {
    const db = getAdminDb();
    const auth = getAdminAuth();
    const body = await req.json();
    const students: Array<{ name: string; childUid: string; class: string }> = body.students;
    if (!Array.isArray(students) || students.length === 0) {
      return NextResponse.json({ error: 'Students array is required and must not be empty' }, { status: 400 });
    }

    const countSnapshot = await db.collection('students').count().get();
    let currentCount = countSnapshot.data()?.count || 0;
    const results: Array<{ success: boolean; name: string; childUid: string; error?: string }> = [];

    for (const s of students) {
      const trimmedName = (s.name || '').trim();
      const trimmedChildUid = (s.childUid || '').trim();
      const trimmedClass = (s.class || '').trim();

      if (!trimmedName || !trimmedChildUid || !trimmedClass) {
        results.push({ success: false, name: trimmedName || 'Unknown', childUid: trimmedChildUid, error: 'Missing required fields' });
        continue;
      }

      try {
        currentCount++;
        const studentId = generateStudentId(currentCount);
        const username = generateUsername(trimmedName, currentCount);
        const { plain, hashed } = generateHashedPassword();
        const email = `${username}@school.com`;
        
        await auth.createUser({ email, password: plain, displayName: trimmedName });
        const userRecord = await auth.getUserByEmail(email);
        await auth.setCustomUserClaims(userRecord.uid, { role: 'student', username });
        
        await db.collection('students').add({
          studentId,
          childUid: trimmedChildUid,
          name: trimmedName,
          class: trimmedClass,
          username,
          email,
          password: hashed,
          photo: '',
          createdAt: new Date().toISOString(),
        });
        
        results.push({ success: true, name: trimmedName, childUid: trimmedChildUid });
      } catch (e: any) {
        results.push({ success: false, name: trimmedName, childUid: trimmedChildUid, error: e.message || 'Failed to create' });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const errors = results.filter(r => !r.success).map(r => `${r.name} (${r.childUid}): ${r.error}`);

    return NextResponse.json({ success: successCount, total: students.length, errors });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to bulk import' }, { status: 500 });
  }
}
