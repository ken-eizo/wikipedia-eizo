// app/post/[id]/page.js
'use client';

import '../[id]/page.css'; // page.css をインポート
import { useParams } from 'next/navigation'; // useParams をインポート
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import db from '../../firebase';

const PostDetailPage = () => {
  const params = useParams(); // useParams でパラメータを取得
  const id = params.id; // id を取得

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchPost = async () => {
        const docRef = doc(db, 'posts', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setPost(docSnap.data());
        } else {
          console.log('No such document!');
        }
        setLoading(false);
      };

      fetchPost();
    }
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!post) {
    return <div>Post not found</div>;
  }

  return (
    <div className='PostDetail'>
      <h1>{post.title}</h1>
      <p className="Detail">{post.content}</p>
      <p className="Created-at">Created at: {post.created_at}</p> {/* created_at の表示形式は後述 */}
    </div>
  );
};

export default PostDetailPage;