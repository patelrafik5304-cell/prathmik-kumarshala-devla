import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    const { fromClass, toClass } = await req.json();
    
    if (!fromClass || !toClass) {
      return NextResponse.json({ error: 'Missing fromClass or toClass' }, { status: 400 });
    }

    const db = getAdminDb();
    
    // Get all students from the source class
    const snapshot = await db.collection('students')
      .where('class', '==', fromClass)
      .get();
    
    if (snapshot.empty) {
      return NextResponse.json({ success: true, updatedCount: 0, message: 'No students found in this class' });
    }

    const batch = db.batch();
    let updatedCount = 0;

    snapshot.docs.forEach((doc) => {
      const studentRef = db.collection('students').doc(doc.id);
      
      if (toClass === 'graduated') {
        // Mark as graduated or delete - let's update a status field
        batch.update(studentRef, { 
          class: 'graduated',
          graduatedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      } else {
        batch.update(studentRef, { 
          class: toClass,
          updatedAt: new Date().toISOString()
        });
      }
      updatedCount++;
    });

    await batch.commit();
    
    return NextResponse.json({ 
      success: true, 
      updatedCount,
      message: `Successfully promoted ${updatedCount} students from Class ${fromClass} to ${toClass === 'graduated' ? 'Graduated' : 'Class ' + toClass}` 
    });
    
  } catch (e: any) {
    console.error('[Students Promote] Error:', e);
    return NextResponse.json({ error: e.message || 'Failed to promote students' }, { status: 500 });
  }
}
