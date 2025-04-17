'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { demoCollection } from '../../firebase';
import './page.css';
import Link from 'next/link';

export default function PostDetail({ params }) {
  const router = useRouter();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const id = use(params).id;

  const [previewPos, setPreviewPos] = useState({ x: 0, y: 0 });

  // タグをクリックしたときの処理を修正
  const handleTagClick = (tag) => {
    // Searchbarと同じフォーマットで検索ページへ遷移
    router.push(`/search/${encodeURIComponent(` tags:${tag}`)}`)
  };

  useEffect(() => {
    const fetchPostAndRelated = async () => {
      try {
        const docRef = doc(demoCollection, id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          const date = new Date(data.created_at);
          const formattedDate = date.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
          
          setPost({
            ...data,
            formattedDate
          });

          // タグに基づいて関連記事を自動的に取得
          if (data.tags && data.tags.length > 0) {
            const postsRef = demoCollection;
            const q = query(
              demoCollection,  // collection(db, "demo")の代わりにdemoCollectionを使用
              where("tags", "array-contains-any", data.tags)
            );
            const querySnapshot = await getDocs(q);
            const related = querySnapshot.docs
              .map(doc => ({
                id: doc.id,
                ...doc.data()
              }))
              .filter(p => p.id !== id) // 現在の記事を除外
              .slice(0, 6); // 最大6件まで表示

            setRelatedPosts(related);
          }
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchPostAndRelated();
  }, [id]);

  // HTMLコンテンツのリンクを修正する関数
  const processContent = (content) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');

    doc.querySelectorAll('a[href^="/post/"]').forEach(link => {
      const href = link.getAttribute('href');
      const postId = href.split('/post/')[1];
      
      link.classList.add('article-link');
      
      // デバッグ用のログを追加
      console.log('リンクを検出:', href, postId);
      
      link.addEventListener('mouseenter', (e) => {
        console.log('マウスエンター:', postId); // デバッグ用
        const rect = e.target.getBoundingClientRect();
        setPreviewPos({
          x: rect.right + 10,
          y: rect.top
        });
      });

      link.addEventListener('mouseleave', () => {
        console.log('マウスリーブ'); // デバッグ用
      });
    });

    return doc.body.innerHTML;
  };

  useEffect(() => {
    if (post) {
      const links = document.querySelectorAll('a[href^="/post/"]');
      
      const handleMouseEnter = (e) => {
        const href = e.target.getAttribute('href');
        const postId = href.split('/post/')[1];
        const rect = e.target.getBoundingClientRect();
        
        setPreviewPos({
          x: rect.right + 10,
          y: rect.top
        });
      };

      const handleMouseLeave = () => {
      };

      links.forEach(link => {
        link.classList.add('article-link');
        link.addEventListener('mouseenter', handleMouseEnter);
        link.addEventListener('mouseleave', handleMouseLeave);
      });

      return () => {
        links.forEach(link => {
          link.removeEventListener('mouseenter', handleMouseEnter);
          link.removeEventListener('mouseleave', handleMouseLeave);
        });
      };
    }
  }, [post]);

  if (!post) return <div>Loading...</div>;

  return (
    <div className='PostidPage'>
      <div className="PostDetail">
        <div className='title'>{post.title}</div>
        <div className="Created-at">
          {post.formattedDate}
        </div>
        {post.tags && post.tags.length > 0 && (
          <div className='article_tags'>
            {post.tags.map((tag, index) => (
              <button
                key={index}
                className='article_tag'
                onClick={() => handleTagClick(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
        <article 
          className="Detail"
          dangerouslySetInnerHTML={{ 
            __html: post ? processContent(post.content) : ''
          }} 
        />

        {/* 関連記事の表示 */}
        {relatedPosts.length > 0 && (
          <div className="related-posts">
            <h3 className="related-posts-title">関連記事</h3>
            <div className="related-posts-list">
              {relatedPosts.map(post => (
                <Link href={`/post/${post.id}`} key={post.id} className="related-post-link">
                  <div className="related-post-card">
                    <h4>{post.title}</h4>
                    <div className="related-post-meta">
                      <span className="related-post-date">
                        {new Date(post.created_at).toLocaleDateString('ja-JP')}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
