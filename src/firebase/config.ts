// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, setAnalyticsCollectionEnabled } from "firebase/analytics";
import { getStorage, ref as storageRef, uploadString, getDownloadURL } from "firebase/storage";
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
setAnalyticsCollectionEnabled(analytics, false); // Disable analytics cookies
export const storage = getStorage(app);
export const db = getFirestore(app);

// Helper function to upload an image to Firebase Storage
export const uploadImageToStorage = async (imageString: string, path: string): Promise<string> => {
  try {
    if (!imageString || !imageString.startsWith('data:')) {
      return '';
    }
    
    const imageRef = storageRef(storage, path);
    const snapshot = await uploadString(imageRef, imageString, 'data_url');
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image to storage:', error);
    throw error;
  }
};