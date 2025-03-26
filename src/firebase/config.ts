// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCcxqoCY2nrEU5uGq2nWkaluGpKoBnj3IY",
  authDomain: "sublimewebsite20250326.firebaseapp.com",
  projectId: "sublimewebsite20250326",
  storageBucket: "sublimewebsite20250326.firebasestorage.app",
  messagingSenderId: "1026075235744",
  appId: "1:1026075235744:web:8ece4ba189d9819e3180c5",
  measurementId: "G-7D64TSY79T"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const storage = getStorage(app);
export const db = getFirestore(app);