'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { demoCollection } from '../../firebase';  // 2階層上のfirebase.jsを参照
import Link from 'next/link';
import './page.css';
import Searchbar from '@/app/components/Searchbar';
import '../../post/Allposts.css'; // AllpostsのCSSを直接インポート

export default function SearchResults() {
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const params = useParams();
    const searchQuery = decodeURIComponent(params.name);

    useEffect(() => {
        const fetchResults = async () => {
            setIsLoading(true);
            try {
                // タグ検索とテキスト検索を分離
                const [searchText, tagsPart] = searchQuery.split(' tags:');
                const tags = tagsPart ? tagsPart.split(',') : [];

                let q;
                if (tags.length > 0) {
                    // タグでフィルタリング
                    q = query(
                        collection(demoCollection),
                        where("tags", "array-contains-any", tags)
                    );
                } else {
                    // 通常の検索
                    q = query(
                        collection(demoCollection),
                        where("title", ">=", searchText),
                        where("title", "<=", searchText + '\uf8ff')
                    );
                }

                const querySnapshot = await getDocs(q);
                const searchResults = [];
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    // テキスト検索がある場合はフィルタリング
                    if (searchText) {
                        if (
                            data.title?.toLowerCase().includes(searchText.toLowerCase()) ||
                            data.content?.toLowerCase().includes(searchText.toLowerCase())
                        ) {
                            searchResults.push({ id: doc.id, ...data });
                        }
                    } else {
                        searchResults.push({ id: doc.id, ...data });
                    }
                });
                setResults(searchResults);
            } catch (error) {
                console.error("検索エラー:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchResults();
    }, [searchQuery]);

    const getStrTime = (time) => {
        let t = new Date(time);
        return (`${t.getFullYear()}/${t.getMonth() + 1}/${t.getDate()} ${t.getHours()}:${t.getMinutes()}:${t.getSeconds()}`);
    }

    // 検索クエリを表示用に整形
    const displayQuery = () => {
        const [searchText, tagsPart] = searchQuery.split(' tags:');
        const tags = tagsPart ? tagsPart.split(',') : [];
        
        return (
            <div className="search-query">
                <span>{searchText}</span>
                {tags.length > 0 && (
                    <div className="search-tags">
                        {tags.map((tag, index) => (
                            <span key={index} className="search-tag">#{tag}</span>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="search-results-page">
            <Searchbar />
            <div className='result-list'>
                <div className="search-header">
                    {displayQuery()}の検索結果
                </div>
                {isLoading ? (
                    <div className="loading">検索中...</div>
                ) : (
                    <div className="results-Group">
                        {results.length > 0 ? (
                            results.map((post) => (
                                <Link href={`/post/${post.id}`} key={post.id}>
                                    <div className="result-card">
                                        <div className='result-card-content'>
                                            <div className='title'>{post.title}</div>
                                            {post.tags && post.tags.length > 0 && (
                                                <div className='post_tags'>
                                                    {post.tags.map((tag, index) => (
                                                        <span key={index} className='preview_tag'>
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
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
                            ))
                        ) : (
                            <p className="no-results">検索結果が見つかりませんでした。</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}