// This script is used to seed the `allowed_emails` collection in Firestore.
// It allows you to programmatically define which email addresses are authorized
// to sign up and log in to your application.

// To use this script:
// 1. Make sure you have downloaded a service account key for your Firebase project.
//    - Go to Firebase Console > Project settings > Service accounts.
//    - Click "Generate new private key" and save the file.
//    - Rename the downloaded file to `service-account.json` and place it in the root of your project.
//    - The `.gitignore` file is already configured to ignore this file.
// 2. Update the `emailsToAllow` array below with the emails you want to authorize.
// 3. Run the script from your terminal: `npm run seed:allowlist`

const admin = require('firebase-admin');
const serviceAccount = require('../service-account.json');

// --- START: YOUR CONFIGURATION ---

// Add the list of emails you want to authorize here.
const emailsToAllow = [
  'pepe@gmail.com',
  'paco@gmail.com',
  'manumezog@gmail.com',
  'test@gmail.com'
];

// --- END: YOUR CONFIGURATION ---


// Initialize Firebase Admin SDK
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} catch (error) {
  if (error.code === 'app/duplicate-app') {
    console.log('Firebase Admin already initialized.');
  } else {
    console.error('Error initializing Firebase Admin SDK:', error);
    process.exit(1);
  }
}

const db = admin.firestore();

async function seedAllowlist() {
  console.log('Starting to seed email allowlist...');

  const allowlistCollection = db.collection('allowed_emails');
  const promises = [];

  for (const email of emailsToAllow) {
    const docRef = allowlistCollection.doc(email.toLowerCase());
    // We use `set` with `merge: true` to create or update.
    // The document just needs to exist; the fields within it don't matter.
    const promise = docRef.set({}, { merge: true });
    promises.push(promise);
    console.log(` - Queued authorization for: ${email}`);
  }

  try {
    await Promise.all(promises);
    console.log('\n✅ Successfully seeded all authorized emails.');
  } catch (error) {
    console.error('\n❌ Error seeding emails:', error);
  }
}

seedAllowlist().then(() => {
    // Firestore writes can take a moment to settle, but the script can exit.
    process.exit(0);
});
