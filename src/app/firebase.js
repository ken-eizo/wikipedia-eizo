'use client';

import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { GoogleAuthProvider } from "firebase/auth";
import { getAuth } from 'firebase/auth';
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyA3H5GJGVKtzYKBRqPlnRpeZ6yIC4HNiRg",
    authDomain: "wikipediaeizo.firebaseapp.com",
    projectId: "wikipediaeizo",
    storageBucket: "wikipediaeizo.firebasestorage.app",
    messagingSenderId: "282678401680",
    appId: "1:282678401680:web:263ec3787153a7c3c01615",
    measurementId: "G-M03TBS744E"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, provider, storage };
export default db;