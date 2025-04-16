'use client';

import { initializeApp } from "firebase/app";
import { getFirestore, collection, deleteDoc, doc, getDoc, addDoc } from 'firebase/firestore';
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
const deleteRequestsCollection = collection(db, "deleteRequests");

const deletePost = async (postId, userId) => {
  try {
    const postRef = doc(demoCollection, postId);
    const postSnap = await getDoc(postRef);
    
    if (!postSnap.exists()) {
      throw new Error('投稿が見つかりません');
    }
    
    const postData = postSnap.data();
    if (postData.authorId !== userId) {
      throw new Error('削除権限がありません');
    }
    
    await deleteDoc(postRef);
    return true;
  } catch (error) {
    console.error('削除エラー:', error);
    throw error;
  }
};

const requestDelete = async (postId, requesterId, reason) => {
  try {
    await addDoc(deleteRequestsCollection, {
      postId,
      requesterId: requesterId || 'anonymous',
      requesterName: auth.currentUser?.displayName || 'ゲスト',
      reason,
      requestedAt: new Date().getTime(),
      status: 'pending' // pending, approved, rejected
    });
    return true;
  } catch (error) {
    console.error('削除リクエストエラー:', error);
    throw error;
  }
};

export { auth, provider, storage, demoCollection, deleteRequestsCollection, deletePost, requestDelete };
export default db;