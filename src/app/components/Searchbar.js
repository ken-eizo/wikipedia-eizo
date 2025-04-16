'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs } from 'firebase/firestore';
import db from '../firebase';
import './Searchbar.css';
import Link from 'next/link';

export default function Searchbar() {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [tags, setTags] = useState([]);
  const [activeTags, setActiveTags] = useState([]);
  const [suggestedTags, setSuggestedTags] = useState([]);

  // 既存のタグを取得
  useEffect(() => {
    const fetchTags = async () => {
      const postsRef = collection(db, "demo");
      const querySnapshot = await getDocs(postsRef);
      const uniqueTags = new Set();

      querySnapshot.docs.forEach(doc => {
        const postTags = doc.data().tags || [];
        postTags.forEach(tag => uniqueTags.add(tag));
      });

      setTags(Array.from(uniqueTags));
    };

    fetchTags();
  }, []);

  const handleSearch = async (value, tagList = activeTags) => {
    if (!value && tagList.length === 0) {
      setSearchResults([]);
      return;
    }

    try {
      const postsRef = collection(db, "demo");
      let q = postsRef;

      // タグでフィルタリング
      if (tagList.length > 0) {
        q = query(postsRef, where('tags', 'array-contains-any', tagList));
      }

      const querySnapshot = await getDocs(q);
      const results = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(post => {
          // テキスト検索
          const searchText = value.replace(/#\w+/g, '').trim().toLowerCase();
          if (!searchText) return true;
          
          return (
            post.title?.toLowerCase().includes(searchText) ||
            post.content?.toLowerCase().includes(searchText)
          );
        });

      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);

    // タグのサジェスト
    const lastWord = value.split(' ').pop();
    if (lastWord.startsWith('#')) {
      const tagPrefix = lastWord.slice(1).toLowerCase();
      const suggested = tags.filter(tag => 
        tag.toLowerCase().startsWith(tagPrefix) &&
        !activeTags.includes(tag)
      );
      setSuggestedTags(suggested);
    } else {
      setSuggestedTags([]);
    }

    handleSearch(value);
  };

  // エンターキーとタグ処理を追加
  const handleKeyDown = (e) => {
    if (e.key === 'Tab' && suggestedTags.length > 0) {
      e.preventDefault();
      const firstSuggestedTag = suggestedTags[0];
      handleTagSelect(firstSuggestedTag);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      // 検索テキストとアクティブなタグを組み合わせた検索クエリを作成
      const searchText = searchValue.replace(/#\w+/g, '').trim();
      let query = searchText;
      
      // タグがある場合は検索クエリに追加
      if (activeTags.length > 0) {
        query += ' tags:' + activeTags.join(',');
      }
      
      // 検索ページへ遷移
      if (query) {
        router.push(`/search/${encodeURIComponent(query)}`);
      }
    }
  };

  const handleTagSelect = (tag) => {
    if (!activeTags.includes(tag)) {
      const newTags = [...activeTags, tag];
      setActiveTags(newTags);
      
      // #タグを含む単語を削除し、残りのテキストを保持
      const words = searchValue.split(' ');
      const newSearchValue = words
        .filter(word => !word.startsWith('#'))
        .join(' ');
      
      setSearchValue(newSearchValue ? newSearchValue + ' ' : '');
      setSuggestedTags([]);
      
      // 新しいタグリストで検索実行
      handleSearch(newSearchValue, newTags);
    }
  };

  const removeTag = (tagToRemove) => {
    const newTags = activeTags.filter(tag => tag !== tagToRemove);
    setActiveTags(newTags);
    handleSearch(searchValue, newTags);
  };

  const executeSearch = () => {
    const searchText = searchValue.replace(/#\w+/g, '').trim();
    let query = searchText;
    
    if (activeTags.length > 0) {
      query += ' tags:' + activeTags.join(',');
    }
    
    if (query) {
      router.push(`/search/${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="searchbar-container">
      <div className="searchbar">
        <input
          type="text"
          value={searchValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown} // キーボードイベントハンドラを追加
          placeholder="検索... (#タグで絞り込み)"
        />
        <span 
          className="material-icons"
          onClick={executeSearch}
          style={{ cursor: 'pointer' }}
        >
          search
        </span>
      </div>

      {/* アクティブなタグの表示 */}
      {activeTags.length > 0 && (
        <div className="active-tags">
          {activeTags.map((tag, index) => (
            <span key={index} className="active-tag">
              #{tag}
              <button onClick={() => removeTag(tag)} className="remove-tag">
                <span className="material-icons">close</span>
              </button>
            </span>
          ))}
        </div>
      )}

      {/* タグのサジェスト */}
      {suggestedTags.length > 0 && (
        <div className="tag-suggestions">
          {suggestedTags.map((tag, index) => (
            <div
              key={index}
              className="suggested-tag"
              onClick={() => handleTagSelect(tag)}
            >
              #{tag}
            </div>
          ))}
        </div>
      )}

      {/* 検索結果 */}
      {searchResults.length > 0 && (
        <div className="search-results">
          {searchResults.map((result) => (
            <div key={result.id} className="search-result-item">
              <Link href={`/post/${result.id}`}>
                <div className="result-title">{result.title}</div>
                {result.tags && (
                  <div className="result-tags">
                    {result.tags.map((tag, index) => (
                      <span key={index} className="result-tag">#{tag}</span>
                    ))}
                  </div>
                )}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}