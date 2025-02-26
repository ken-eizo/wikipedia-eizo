"use client";

import "./posts.css";
import { collection, onSnapshot } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import db from '../firebase'
import Link from 'next/link';

const getStrTime = (time) => {
    let t = new Date(time);
    return (`${t.getFullYear()}/${t.getMonth() + 1}/${t.getDate()} ${t.getHours()}:${t.getMinutes()}:${t.getSeconds()}`);
}

const AllPosts = () => {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        onSnapshot(collection(db, 'posts'), (snapshot) => {
            setPosts(
                snapshot.docs.map((doc) => ({
                    id: doc.id, // 🔹 FirebaseのドキュメントIDを追加
                    ...doc.data(),
                })).sort((a, b) => b.created_at - a.created_at)
            );
            return () => unsubscribe();
        });
    }, []);

    return (
        <div className="postspage">
            <p>投稿一覧</p>
            <div className="PostGroup">
                {posts.map((post) => (
                    <Link href={`/post/${post.id}`} key={post.id}>
                        <div className='post_card'>
                            <div className='post_card_content'>
                                <div className='title'> {post.title}</div>
                                <div className='content'> {post.content}</div>
                                <div className='created_at'>投稿日：{getStrTime(post.created_at)}</div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default AllPosts
