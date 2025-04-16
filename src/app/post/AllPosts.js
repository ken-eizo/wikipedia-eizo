"use client";

import "./Allposts.css";
import { collection, onSnapshot, deleteDoc, doc, getDocs } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { demoCollection, deleteRequestsCollection, requestDelete } from '../firebase';
import Link from 'next/link';
import Image from 'next/image';
import { getAuth } from 'firebase/auth';
import { useRouter } from 'next/navigation';

const getStrTime = (time) => {
    let t = new Date(time);
    return (`${t.getFullYear()}/${t.getMonth() + 1}/${t.getDate()} ${t.getHours()}:${t.getMinutes()}:${t.getSeconds()}`);
}

const AllPosts = () => {
    const [posts, setPosts] = useState([]);
    const [hiddenPosts, setHiddenPosts] = useState(new Set());
    const auth = getAuth();
    const router = useRouter();
    
    const handleDelete = async (postId, authorId, e) => {
        e.preventDefault(); // Linkのナビゲーションを防ぐ
        
        if (auth.currentUser?.uid !== authorId) {
            alert('削除権限がありません');
            return;
        }

        if (!window.confirm('この投稿を削除しますか？')) return;

        try {
            await deleteDoc(doc(demoCollection, postId));
            alert('投稿を削除しました');
        } catch (error) {
            console.error('削除エラー:', error);
            alert('削除に失敗しました');
        }
    };

    const handleEdit = (postId, e) => {
        e.preventDefault(); // Linkのナビゲーションを防ぐ
        router.push(`/post/edit/${postId}`);
    };

    const handleDeleteRequest = async (postId, e) => {
        e.preventDefault();
        
        const reason = window.prompt('削除をリクエストする理由を入力してください：');
        if (!reason) return;
      
        try {
          await requestDelete(postId, auth.currentUser?.uid, reason);
          setHiddenPosts(prev => new Set([...prev, postId]));
          alert('削除リクエストを送信しました');
        } catch (error) {
          console.error('削除リクエストエラー:', error);
          alert('削除リクエストの送信に失敗しました');
        }
    };

    useEffect(() => {
        const unsubscribe = onSnapshot(demoCollection, (snapshot) => {
            setPosts(
                snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })).sort((a, b) => b.created_at - a.created_at)
            );
        });

        return () => unsubscribe();
    }, []);

    // 削除リクエスト済みの投稿を非表示にする
    useEffect(() => {
        const fetchDeleteRequests = async () => {
          const querySnapshot = await getDocs(deleteRequestsCollection);
          const hiddenPostIds = new Set();
          querySnapshot.forEach(doc => {
            const request = doc.data();
            if (request.status === 'pending') {
              hiddenPostIds.add(request.postId);
            }
          });
          setHiddenPosts(hiddenPostIds);
        };
        fetchDeleteRequests();
    }, []);

    return (
        <div className="postspage">
            <p className="PostList">記事一覧</p>
            <div className="PostGroup">
                {posts.filter(post => !hiddenPosts.has(post.id)).map((post) => (
                    <Link href={`/post/${post.id}`} key={post.id}>
                        <div className='post_card'>
                            <div className="post-actions">
                                {auth.currentUser?.uid === post.authorId ? (
                                    // 投稿者本人の場合
                                    <>
                                        <button
                                            onClick={(e) => handleEdit(post.id, e)}
                                            className='action-button edit-button'
                                            title='編集'
                                        >
                                            <span className="material-icons">edit</span>
                                        </button>
                                        <button
                                            onClick={(e) => handleDelete(post.id, post.authorId, e)}
                                            className='action-button delete-button'
                                            title='削除'
                                        >
                                            <span className="material-icons">close</span>
                                        </button>
                                    </>
                                ) : post.authorId === 'guest' && (
                                    // ゲスト投稿の場合
                                    <button
                                        onClick={(e) => handleDeleteRequest(post.id, e)}
                                        className='action-button request-delete-button'
                                        title='削除をリクエスト'
                                    >
                                        <span className="material-icons">report</span>
                                    </button>
                                )}
                            </div>
                            <div className='post_card_content'>
                                <div className='title'>{post.title}</div>
                                {/* タグを先に表示 */}
                                {post.tags && post.tags.length > 0 && (
                                    <div className='post_tags'>
                                        {post.tags.map((tag, index) => (
                                            <span key={index} className='preview_tag'>
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                {/* 投稿者情報を最後に表示 */}
                                <div className='post_footer'>
                                    <div className='author_info'>
                                        {post.authorPhotoURL ? (
                                            <img
                                                src={post.authorPhotoURL}
                                                alt={post.authorName || 'ゲスト'}
                                                className='author_avatar'
                                            />
                                        ) : (
                                            <div className='author_avatar_placeholder'>
                                                {(post.authorName || 'ゲスト')[0]}
                                            </div>
                                        )}
                                        <span className='author_name'>{post.authorName || 'ゲスト'}</span>
                                    </div>
                                    <div className='created_at'>投稿日：{getStrTime(post.created_at)}</div>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default AllPosts
