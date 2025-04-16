"use client";

import "./Allposts.css";
import { collection, onSnapshot } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import { demoCollection } from '../firebase';
import Link from 'next/link';
import Image from 'next/image';

const getStrTime = (time) => {
    let t = new Date(time);
    return (`${t.getFullYear()}/${t.getMonth() + 1}/${t.getDate()} ${t.getHours()}:${t.getMinutes()}:${t.getSeconds()}`);
}

const AllPosts = () => {
    const [posts, setPosts] = useState([]);

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

    return (
        <div className="postspage">
            <p className="PostList">記事一覧</p>
            <div className="PostGroup">
                {posts.map((post) => (
                    <Link href={`/post/${post.id}`} key={post.id}>
                        <div className='post_card'>
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
