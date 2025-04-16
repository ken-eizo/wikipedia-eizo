'use client';

import { useState, useEffect } from 'react';
import { getAuth, updateProfile } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import './profile.css';

export default function ProfilePage() {
  const auth = getAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (auth.currentUser) {
      setDisplayName(auth.currentUser.displayName || '');
      setPhotoURL(auth.currentUser.photoURL || '');
    } else {
      router.push('/');
    }
  }, [auth.currentUser]);

  const handlePhotoURLChange = (e) => {
    setPhotoURL(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateProfile(auth.currentUser, {
        displayName: displayName,
        photoURL: photoURL
      });
      alert('プロフィールを更新しました');
    } catch (error) {
      console.error('更新エラー:', error);
      alert('更新に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <h1>プロフィール設定</h1>
      <form onSubmit={handleSubmit} className="profile-form">
        <div className="avatar-preview">
          <img 
            src={photoURL || '/images/default-avatar.png'} 
            alt="プロフィール画像"
            onError={(e) => {
              e.target.src = '/images/default-avatar.png';
              e.target.onerror = null;
            }}
          />
        </div>
        
        <div className="form-group">
          <label>表示名</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="表示名を入力"
            className="input-field"
          />
        </div>

        <div className="form-group">
          <label>画像URL</label>
          <input
            type="url"
            value={photoURL}
            onChange={handlePhotoURLChange}
            placeholder="画像URLを入力"
            className="input-field"
          />
        </div>

        <button type="submit" className="update-button" disabled={isLoading}>
          {isLoading ? '更新中...' : '更新する'}
        </button>
      </form>
    </div>
  );
}