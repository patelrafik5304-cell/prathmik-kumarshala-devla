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

export async function POST(req: NextRequest) {
  try {
    const db = getAdminDb();
    const auth = getAdminAuth();
    const body = await req.json();
    const students: Array<{ name: string; childUid: string; class: string }> = body.students;
    
    if (!Array.isArray(students) || students.length === 0) {
      return NextResponse.json({ error: 'Students array is required and must not be empty' }, { status: 400 });
    }

    if (students.length > 100) {
      return NextResponse.json({ error: 'Maximum 100 students allowed per import' }, { status: 400 });
    }

    const countSnapshot = await db.collection('students').count().get();
    let currentCount = countSnapshot.data()?.count || 0;
    
    const results: Array<{ success: boolean; name: string; childUid: string; username?: string; password?: string; error?: string }> = [];
    const batch = db.batch();
    const usersToCreate: Array<{ email: string; password: string; displayName: string; username: string }> = [];

    // Prepare all users
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
        const plainPassword = generatePassword();
        const hashedPassword = await bcrypt.hash(plainPassword, 10);
        const email = `${username}@school.com`;

        usersToCreate.push({ email, password: plainPassword, displayName: trimmedName, username });

        const docRef = db.collection('students').doc();
        batch.set(docRef, {
          studentId,
          childUid: trimmedChildUid,
          name: trimmedName,
          class: trimmedClass,
          username,
          email,
          password: hashedPassword,
          plainPassword: plainPassword, // Store plain password temporarily for PDF
          photo: '',
          createdAt: new Date().toISOString(),
        });

        results.push({ success: true, name: trimmedName, childUid: trimmedChildUid, username, password: plainPassword });
      } catch (e: any) {
        results.push({ success: false, name: trimmedName, childUid: trimmedChildUid, error: e.message || 'Failed to create' });
      }
    }

    // Batch write to Firestore
    await batch.commit();

    // Create Firebase Auth users in parallel (after Firestore success)
    const authPromises = usersToCreate.map(async (userData) => {
      try {
        const userRecord = await auth.createUser({ 
          email: userData.email, 
          password: userData.password, 
          displayName: userData.displayName 
        });
        await auth.setCustomUserClaims(userRecord.uid, { role: 'student', username: userData.username });
      } catch (e: any) {
        console.error('Auth creation failed for', userData.username, e.message);
      }
    });

    await Promise.all(authPromises);

    const successCount = results.filter(r => r.success).length;
    const errors = results.filter(r => !r.success).map(r => `${r.name} (${r.childUid}): ${r.error}`);
    const credentials = results.filter(r => r.success).map(r => ({ name: r.name, username: r.username, password: r.password }));

    return NextResponse.json({ success: successCount, total: students.length, errors, credentials });
  } catch (e: any) {
    console.error('[Bulk Import] Error:', e);
    return NextResponse.json({ error: e.message || 'Failed to bulk import' }, { status: 500 });
  }
}
