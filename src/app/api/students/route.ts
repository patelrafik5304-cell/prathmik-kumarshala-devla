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

async function createStudentUser(name: string, count: number) {
  const db = getAdminDb();
  const auth = getAdminAuth();
  const username = generateUsername(name, count);
  const password = generatePassword();
  const hashedPassword = await bcrypt.hash(password, 10);
  const email = `${username}@school.com`;
  await auth.createUser({ email, password, displayName: name });
  const userRecord = await auth.getUserByEmail(email);
  await auth.setCustomUserClaims(userRecord.uid, { role: 'student', username });
  return { username, password, hashedPassword, email };
}

async function getCount(): Promise<number> {
  const db = getAdminDb();
  const snapshot = await db.collection('students').count().get();
  return snapshot.data()?.count || 0;
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getAdminDb();
    const snapshot = await db.collection('students').get();
    const students = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    students.sort((a: any, b: any) => {
      const dateA = (a as any).createdAt || '';
      const dateB = (b as any).createdAt || '';
      return dateB.localeCompare(dateA);
    });
    return NextResponse.json(students, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    });
  } catch (e: any) {
    console.error('[Students GET] Error:', e);
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = getAdminDb();
    const body = await req.json();
    if (!body.name || !body.childUid) {
      return NextResponse.json({ error: 'Name and Child UID are required' }, { status: 400 });
    }
    const count = await getCount();
    const countNum = count + 1;
    const studentId = generateStudentId(countNum);
    const { username, password, hashedPassword, email } = await createStudentUser(body.name, countNum);
    const docRef = await db.collection('students').add({
      studentId,
      childUid: body.childUid,
      name: body.name,
      class: body.class,
      username,
      email,
      password: hashedPassword,
      photo: body.photo || '',
      createdAt: new Date().toISOString(),
    });
    return NextResponse.json({
      id: docRef.id,
      studentId,
      childUid: body.childUid,
      name: body.name,
      class: body.class,
      username,
      password,
      email,
      photo: body.photo || '',
    }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to create student' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const db = getAdminDb();
    const { id, ...data } = await req.json();
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    await db.collection('students').doc(id).update(data);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const db = getAdminDb();
    const auth = getAdminAuth();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const className = searchParams.get('class');

    // SINGLE DELETE
    if (id) {
      const doc = await db.collection('students').doc(id).get();
      if (!doc.exists) {
        return NextResponse.json({ error: 'Student not found' }, { status: 404 });
      }

      const email = doc.data()?.email;
      if (email) {
        try {
          const user = await auth.getUserByEmail(email);
          await auth.deleteUser(user.uid);
        } catch (e: any) {
          console.log('[Students DELETE] Auth delete skipped:', e.message);
        }
      }

      await db.collection('students').doc(id).delete();
      return NextResponse.json({ success: true });
    }

    // BULK DELETE BY CLASS
    if (className) {
      const snapshot = await db.collection('students').where('class', '==', className).get();
      if (snapshot.empty) {
        return NextResponse.json({ error: 'No students found in this class' }, { status: 404 });
      }

      const batch = db.batch();
      const authDeletes: Promise<any>[] = [];

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.email) {
          try {
            authDeletes.push(
              auth.getUserByEmail(data.email).then((user) => auth.deleteUser(user.uid))
            );
          } catch (e: any) {
            console.log('[Bulk Delete] Auth delete skipped:', e.message);
          }
        }
        batch.delete(doc.ref);
      });

      await batch.commit();
      await Promise.allSettled(authDeletes);

      // CASCADE: Delete attendance records for this class
      const attendanceSnapshot = await db.collection('attendance')
        .where('class', '==', className)
        .get();
      if (!attendanceSnapshot.empty) {
        const attendanceBatch = db.batch();
        attendanceSnapshot.docs.forEach((doc) => attendanceBatch.delete(doc.ref));
        await attendanceBatch.commit();
      }

      // CASCADE: Delete results records for this class
      const resultsSnapshot = await db.collection('results')
        .where('class', '==', className)
        .get();
      if (!resultsSnapshot.empty) {
        const resultsBatch = db.batch();
        resultsSnapshot.docs.forEach((doc) => resultsBatch.delete(doc.ref));
        await resultsBatch.commit();
      }

      const displayClass = className === '0' ? 'BALVATIKA' : `Class ${className}`;

      return NextResponse.json({
        success: true,
        deletedCount: snapshot.size,
        className,
        message: `Deleted ${snapshot.size} students from ${displayClass}`,
      });
    }

    return NextResponse.json({ error: 'Missing id or class parameter' }, { status: 400 });
  } catch (e: any) {
    console.error('[Students DELETE] Error:', e);
    return NextResponse.json({ error: e.message || 'Failed to delete' }, { status: 500 });
  }
}
