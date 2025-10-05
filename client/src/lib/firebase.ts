// Firebase authentication configuration - based on blueprint:firebase_barebones_javascript
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  onAuthStateChanged,
  User
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCesMHXYJ9nFHi-AAK9ubKJ3bl2LcCCpSU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "neuravision-auth.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://neuravision-auth-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "neuravision-auth",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "neuravision-auth.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "349816412688",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:349816412688:web:c54637486be3a21994c895",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-N3XYP3F5E2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Initialize Google provider
const googleProvider = new GoogleAuthProvider();

// Authentication functions
export const signUpWithEmailAndPassword = async (email: string, password: string, username: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(userCredential.user, {
    displayName: username,
  });
  return userCredential.user;
};

export const signInWithEmail = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const logOut = async () => {
  await signOut(auth);
};

// Google authentication functions
export const signInWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
};

export const signUpWithGoogle = async () => {
  // For Google authentication, signup and signin are the same process
  return signInWithGoogle();
};

// Auth state listener
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};