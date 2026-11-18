import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';

// WazalGames Center - Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAhAiaTCirDG_aA1mweGIgHfStX6IBIRtw",
  authDomain: "wazalgames-center.firebaseapp.com",
  projectId: "wazalgames-center",
  storageBucket: "wazalgames-center.firebasestorage.app",
  messagingSenderId: "846628518934",
  appId: "1:846628518934:web:8f3d9e198adcd079474937"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);

// Initialize Firestore Database
const db = getFirestore(app);

// Initialize Storage
const storage = getStorage(app);

// Initialize Realtime Database for chat
const realtimeDb = getDatabase(app);

export { auth, db, storage, realtimeDb, app };
