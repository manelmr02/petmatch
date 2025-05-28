import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBd7dr5WPiFGLdLl9ToVc5g7a45kt3omYM",
    authDomain: "petmatch-cf175.firebaseapp.com",
    projectId: "petmatch-cf175",
    storageBucket: "petmatch-cf175.firebasestorage.app",
    messagingSenderId: "554184011415",
    appId: "1:554184011415:web:d1c9203eed80fd917503d2"
};
  
// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);