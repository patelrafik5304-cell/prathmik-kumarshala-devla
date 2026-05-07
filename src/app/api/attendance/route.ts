import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  try {
    const db = getAdminDb();
    const { searchParams } = new URL(req.url);
    const studentUsername = searchParams.get('studentUsername');
    const date = searchParams.get('date');

    console.log('[Attendance GET] studentUsername:', studentUsername, 'date:', date);

    // Fetch holiday/vacation ranges
    const announcementsSnapshot = await db.collection('announcements')
      .where('type', 'in', ['holiday', 'vacation'])
      .get();
    
    const holidayRanges = announcementsSnapshot.docs
      .map(doc => {
        const data = doc.data();
        return {
          startDate: data.startDate || data.date,
          endDate: data.endDate || data.date,
          isActive: data.isActive
        };
      })
      .filter(range => range.isActive !== false && range.startDate && range.endDate);

    let query: any = db.collection('attendance');

    if (studentUsername) {
      query = query.where('studentUsername', '==', studentUsername);
    }
    if (date) {
      query = query.where('date', '==', date);
    }

    const snapshot = await query.get();
    let records = snapshot.docs.map((doc: any) => ({ ...doc.data(), id: doc.id }));

    // Filter out records that fall within holiday/vacation periods
    records = records.filter((record: any) => {
      const recordDate = record.date;
      return !holidayRanges.some(range => 
        recordDate >= range.startDate && recordDate <= range.endDate
      );
    });

    console.log('[Attendance GET] Found:', records.length, 'records');
    if (records.length > 0) {
      console.log('[Attendance GET] First record:', JSON.stringify(records[0]));
    }

    records.sort((a: any, b: any) => (b.date || '').localeCompare(a.date || ''));

    return NextResponse.json(records, {
      headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120' },
    });
  } catch (e: any) {
    console.error('[Attendance GET] Error:', e);
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = getAdminDb();
    const body = await req.json();
    const records = Array.isArray(body) ? body : [body];

    console.log('[Attendance POST] Received', records.length, 'records');
    console.log('[Attendance POST] First record:', JSON.stringify(records[0]));

    // Fetch holiday/vacation announcements to validate dates
    const announcementsSnapshot = await db.collection('announcements')
      .where('type', 'in', ['holiday', 'vacation'])
      .get();
    
    const holidayRanges = announcementsSnapshot.docs
      .map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || 'Holiday/Vacation',
          type: data.type,
          isActive: data.isActive,
          startDate: data.startDate || data.date,
          endDate: data.endDate || data.date
        };
      })
      .filter(range => range.isActive !== false && range.startDate && range.endDate);

    console.log('[Attendance POST] Active holiday ranges:', holidayRanges);

    // Check if any record falls within a holiday/vacation period
    const invalidRecords = records.filter(record => {
      const recordDate = record.date;
      return holidayRanges.some(range => 
        recordDate >= range.startDate && recordDate <= range.endDate
      );
    });

    if (invalidRecords.length > 0) {
      const blockingHoliday = holidayRanges.find(range => 
        invalidRecords[0].date >= range.startDate && invalidRecords[0].date <= range.endDate
      );
      const reason = blockingHoliday 
        ? `Attendance cannot be marked: "${blockingHoliday.title}" (${blockingHoliday.type}) is active from ${blockingHoliday.startDate} to ${blockingHoliday.endDate}`
        : 'Attendance cannot be filled for holiday/vacation dates';
      console.log('[Attendance POST] Blocked by:', reason);
      return NextResponse.json(
        { error: reason },
        { status: 400 }
      );
    }

    // Get existing records for the same date to delete them
    const dateToUpdate = records[0]?.date;
    console.log('[Attendance POST] Updating attendance for date:', dateToUpdate);
    
    const existingSnapshot = await db.collection('attendance')
      .where('date', '==', dateToUpdate)
      .get();
    
    console.log('[Attendance POST] Found', existingSnapshot.size, 'existing records for date');

    const batch = db.batch();
    
    // Delete existing records for the same date
    existingSnapshot.docs.forEach((doc: any) => {
      console.log('[Attendance POST] Deleting doc:', doc.id);
      batch.delete(doc.ref);
    });

    // Add new records
    records.forEach((record) => {
      const ref = db.collection('attendance').doc();
      console.log('[Attendance POST] Adding record:', record.studentUsername, record.status);
      batch.set(ref, { ...record, createdAt: new Date().toISOString() });
    });
    
    await batch.commit();
    console.log('[Attendance POST] Batch committed successfully');

    // Verify the save
    const verifySnapshot = await db.collection('attendance')
      .where('date', '==', dateToUpdate)
      .get();
    console.log('[Attendance POST] Verification: Found', verifySnapshot.size, 'records after save');

    return NextResponse.json({ success: true, count: records.length, saved: verifySnapshot.size }, { status: 201 });
  } catch (e: any) {
    console.error('[Attendance POST] Error:', e);
    return NextResponse.json({ error: e.message || 'Failed to save attendance' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const db = getAdminDb();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    await db.collection('attendance').doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
