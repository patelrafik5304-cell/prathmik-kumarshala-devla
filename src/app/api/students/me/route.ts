import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');
    
    if (!username) {
      return NextResponse.json({ error: 'Username required' }, { status: 400 });
    }

    console.log('[Students Me] Fetching profile for username:', username);

    const db = getAdminDb();
    
    // Try exact match first
    let snapshot = await db.collection('students')
      .where('username', '==', username)
      .limit(1)
      .get();

    // If not found, try case-insensitive search
    if (snapshot.empty) {
      console.log('[Students Me] No exact match, trying case-insensitive search');
      const allStudents = await db.collection('students').get();
      const matchingDoc = allStudents.docs.find(doc => 
        doc.data().username?.toLowerCase() === username.toLowerCase()
      );
      
      if (matchingDoc) {
        const studentData = matchingDoc.data();
        const { password, ...safeStudent } = studentData;
        console.log('[Students Me] Found with case-insensitive match:', matchingDoc.id);
        return NextResponse.json({ ...safeStudent, id: matchingDoc.id });
      }
    }

    if (snapshot.empty) {
      console.log('[Students Me] Student not found for username:', username);
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const studentData = snapshot.docs[0].data();
    const studentId = snapshot.docs[0].id;

    // Remove password from response for security
    const { password, ...safeStudent } = studentData;

    console.log('[Students Me] Successfully fetched profile for:', username);
    return NextResponse.json({ ...safeStudent, id: studentId });
  } catch (e: any) {
    console.error('[Students Me] Error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
