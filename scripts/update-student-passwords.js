const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');
const bcrypt = require('bcryptjs');

// Load environment variables from .env.local if available
try {
  require('dotenv').config({ path: '.env.local' });
} catch (e) {
  // dotenv not installed, continue
}

// Initialize Firebase Admin
const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined;

if (!getApps().length) {
  if (projectId && clientEmail && privateKey) {
    initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
  } else {
    console.error('Missing Firebase credentials. Please set environment variables.');
    process.exit(1);
  }
}

const db = getFirestore();
const auth = getAuth();

function generatePassword() {
  const chars = '0123456789';
  let password = '';
  for (let i = 0; i < 6; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

async function updateStudentPasswords() {
  try {
    console.log('Fetching all students...');
    const snapshot = await db.collection('students').get();

    if (snapshot.empty) {
      console.log('No students found.');
      return;
    }

    console.log(`Found ${snapshot.size} students. Updating passwords...`);

    let updated = 0;
    let failed = 0;

    for (const doc of snapshot.docs) {
      const studentData = doc.data();
      const studentId = doc.id;

      try {
        const newPassword = generatePassword();
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update Firestore document
        await doc.ref.update({
          password: hashedPassword,
          plainPassword: newPassword,
        });

        // Update Firebase Auth user password if email exists
        if (studentData.email) {
          try {
            const userRecord = await auth.getUserByEmail(studentData.email);
            await auth.updateUser(userRecord.uid, { password: newPassword });
          } catch (authError) {
            console.warn(`Could not update Auth for ${studentData.email}:`, authError.message);
          }
        }

        updated++;
        console.log(`Updated: ${studentData.name || studentId}`);
      } catch (error) {
        failed++;
        console.error(`Failed to update ${studentData.name || studentId}:`, error.message);
      }
    }

    console.log(`\nPassword update complete!`);
    console.log(`Successfully updated: ${updated}`);
    console.log(`Failed: ${failed}`);
  } catch (error) {
    console.error('Error updating passwords:', error.message);
  }
}

updateStudentPasswords()
  .then(() => {
    console.log('Script finished.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error.message);
    process.exit(1);
  });
