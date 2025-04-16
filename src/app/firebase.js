'use client';

import { initializeApp } from "firebase/app";
import { getFirestore, collection } from 'firebase/firestore';
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
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const storage = getStorage(app);

// コレクション参照を作成
const demoCollection = collection(db, "demo");  // postsからdemoに変更

export { auth, provider, storage, demoCollection };  // demoCollectionをエクスポート
export default db;