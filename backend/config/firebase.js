/**
 * Firebase Admin SDK Configuration
 * Used to verify Firebase ID tokens sent from the frontend
 * 
 * The frontend uses Firebase Auth (client SDK) for login.
 * The backend uses Firebase Admin SDK to VERIFY those tokens.
 * 
 * NOTE: If Firebase credentials are not configured, the app still works
 * with local JWT authentication. Firebase auth endpoints will return an error.
 */
const admin = require('firebase-admin');

let firebaseInitialized = false;

// Initialize Firebase Admin only once
try {
  if (!admin.apps.length && process.env.FIREBASE_PROJECT_ID && 
      process.env.FIREBASE_PROJECT_ID !== 'your-firebase-project-id') {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Replace escaped newlines in the private key string
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
    firebaseInitialized = true;
    console.log('✅ Firebase Admin SDK initialized');
  } else {
    console.log('⚠️  Firebase Admin SDK not configured — local JWT auth still works');
  }
} catch (error) {
  console.log('⚠️  Firebase Admin SDK failed to initialize:', error.message);
  console.log('   Local JWT authentication will still work.');
}

module.exports = admin;
module.exports.firebaseInitialized = firebaseInitialized;
