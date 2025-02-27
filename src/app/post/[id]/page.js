'use client';

import '../[id]/page.css'; // page.css をインポート
import { useParams } from 'next/navigation'; // useParams をインポート
import { useState, useEffect } from 'react';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import db from '../../firebase';

const PostDetailPage = () => {
  const params = useParams(); // useParams でパラメータを取得
  const id = params.id; // id を取得

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [links, setLinks] = useState([]);

  useEffect(() => {
    const fetchLinks = async () => {
      const postsCollection = collection(db, 'posts');
      const snapshot = await getDocs(postsCollection);
      const allPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLinks(allPosts);
    };

    const fetchPost = async () => {
      if (id) {
        try {
          const docRef = doc(db, 'posts', id);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            setPost(docSnap.data());
          } else {
            console.log('No such document!');
          }
        } catch (error) {
          console.error('Error fetching post:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchLinks();
    fetchPost();
  }, [id]);

  // 全投稿の title と id の対応を1つのマッピングにまとめ、1つの正規表現でリンク化する
  const createLinks = (content) => {
    if (!links.length) return content;

    // タイトルと id のマッピングを作成
    const titleToId = links.reduce((acc, link) => {
      acc[link.title] = link.id;
      return acc;
    }, {});

    // 正規表現用にタイトル中の特殊文字をエスケープ
    const escapedTitles = Object.keys(titleToId).map(title =>
      title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    );

    // いずれかのタイトルにマッチする正規表現を作成（単語単位でマッチ）
    const regex = new RegExp(`\\b(${escapedTitles.join('|')})\\b`, 'g');

    // マッチしたタイトルを firebase の id を使ったリンクに置換
    return content.replace(regex, (match) => {
      return `<a class="linked-text" href="/post/${titleToId[match]}">${match}</a>`;
    });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!post) {
    return <div>Post not found</div>;
  }

  return (
    <div className='PostDetail'>
      <h1>{post.title}</h1>
      <p
        className="Detail"
        dangerouslySetInnerHTML={{ __html: createLinks(post.content) }}
      ></p>
      <p className="Created-at">Created at: {post.created_at}</p>
    </div>
  );
};

export default PostDetailPage;
