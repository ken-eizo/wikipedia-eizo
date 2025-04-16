'use client';
import { useState, useRef, useEffect } from 'react';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import db, { storage } from "../firebase";
import { getAuth } from 'firebase/auth';
import './NewPost.css';
import { demoCollection } from '../firebase';

// 記事検索用のミニサーチバーコンポーネント
const ArticleSearch = ({ isOpen, onClose, onSelect, style }) => {
  const [searchValue, setSearchValue] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async (value) => {
    if (!value.trim()) {
      setResults([]);
      return;
    }

    try {
      const postsRef = query(demoCollection);
      const q = query(
        postsRef,
        where("title", ">=", value),
        where("title", "<=", value + '\uf8ff')
      );
      const querySnapshot = await getDocs(q);
      setResults(querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
    } catch (error) {
      console.error("検索エラー:", error);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      handleSearch(searchValue);
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchValue]);

  if (!isOpen) return null;

  return (
    <div 
      className="article-search-overlay" 
      style={{
        ...style,
        position: 'absolute',
        background: 'transparent'
      }}
    >
      <div className="article-search-container">
        <div className="search-header">
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="記事を検索..."
            className="article-search-input"
            autoFocus
          />
          <button onClick={onClose} className="close-button">
            <span className="material-icons">close</span>
          </button>
        </div>
        {results.length > 0 && (
          <div className="article-search-results">
            {results.map((post) => (
              <div
                key={post.id}
                className="article-search-item"
                onClick={() => {
                  onSelect(`/post/${post.id}`, post.title);
                  onClose();
                }}
              >
                {post.title}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const MenuBar = ({ editor }) => {
  const imageInputRef = useRef(null);
  const [isArticleSearchOpen, setIsArticleSearchOpen] = useState(false);

  if (!editor) return null;

  const handleImageUpload = async (file) => {
    if (!file) return;
    try {
      // ファイルを一時的にBase64として読み込む
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          // 一旦Base64で画像を表示（即時表示のため）
          editor.chain().focus().setImage({ 
            src: e.target.result 
          }).run();

          // Firebase Storageへのアップロード
          const storageRef = ref(storage, `images/${Date.now()}_${file.name}`);
          await uploadBytes(storageRef, file);
          const url = await getDownloadURL(storageRef);

          // Base64の画像をアップロードされたURLの画像に置き換え
          const doc = editor.view.state.doc;
          doc.descendants((node, pos) => {
            if (node.type.name === 'image' && node.attrs.src === e.target.result) {
              editor.chain().focus().setNodeSelection(pos).updateAttributes('image', {
                src: url
              }).run();
            }
          });
        } catch (error) {
          console.error("画像アップロードエラー:", error);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("画像読み込みエラー:", error);
    }
  };

  const handleArticleLink = (path, title) => {
    editor.chain().focus().setLink({ 
      href: path,
      title: title,
      target: '_self',
      class: 'article-link'  // リンクにクラスを追加
    }).run();
  };

  return (
    <div className="editor-menubar">
      <div className="menu-group">
        <button 
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
          title="大見出し"
        >
          <span className="material-icons">title</span>
        </button>
        <button 
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
          title="中見出し"
        >
          H2
        </button>
        <button 
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}
          title="小見出し"
        >
          H3
        </button>
      </div>

      <div className="menu-group">
        <button 
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'is-active' : ''}
          title="太字"
        >
          <span className="material-icons">format_bold</span>
        </button>
        <button 
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'is-active' : ''}
          title="斜体"
        >
          <span className="material-icons">format_italic</span>
        </button>
        <button 
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive('strike') ? 'is-active' : ''}
          title="取り消し線"
        >
          <span className="material-icons">format_strikethrough</span>
        </button>
      </div>

      <div className="menu-group">
        <button 
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'is-active' : ''}
          title="箇条書き"
        >
          <span className="material-icons">format_list_bulleted</span>
        </button>
        <button 
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'is-active' : ''}
          title="番号付きリスト"
        >
          <span className="material-icons">format_list_numbered</span>
        </button>
        <button 
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive('blockquote') ? 'is-active' : ''}
          title="引用"
        >
          <span className="material-icons">format_quote</span>
        </button>
      </div>

      <div className="menu-group">
        <button 
          onClick={() => setIsArticleSearchOpen(true)}
          title="記事にリンク"
        >
          <span className="material-icons">article</span>
        </button>
        <button 
          onClick={() => {
            const url = window.prompt('外部リンクを入力:');
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          className={editor.isActive('link') ? 'is-active' : ''}
          title="外部リンク"
        >
          <span className="material-icons">link</span>
        </button>
        <button
          onClick={() => editor.chain().focus().unsetLink().run()}
          title="リンクを解除"
        >
          <span className="material-icons">link_off</span>
        </button>
      </div>

      <div className="menu-group">
        <input
          type="file"
          ref={imageInputRef}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageUpload(file);
            // 同じファイルを連続で選択できるようにする
            e.target.value = '';
          }}
          accept="image/*"
          style={{ display: 'none' }}
        />
        <button
          onClick={() => imageInputRef.current?.click()}
          title="画像を挿入"
          type="button"
        >
          <span className="material-icons">image</span>
        </button>
        <button
          onClick={() => editor.chain().focus().insertTable({
            rows: 3,
            cols: 3,
            withHeaderRow: true
          }).run()}
          title="表を挿入"
        >
          <span className="material-icons">table_chart</span>
        </button>
      </div>

      <div className="menu-group">
        <button
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}
          title="左揃え"
        >
          <span className="material-icons">format_align_left</span>
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}
          title="中央揃え"
        >
          <span className="material-icons">format_align_center</span>
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}
          title="右揃え"
        >
          <span className="material-icons">format_align_right</span>
        </button>
      </div>

      <ArticleSearch
        isOpen={isArticleSearchOpen}
        onClose={() => setIsArticleSearchOpen(false)}
        onSelect={handleArticleLink}
      />
    </div>
  );
};

const NewPost = ({ initialData = null, isEditing = false, postId = null, onSave = null }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [title, setTitle] = useState(initialData?.title || '');
  const [tags, setTags] = useState(initialData?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [suggestedTags, setSuggestedTags] = useState([]);
  const [existingTags, setExistingTags] = useState([]); // 既存のタグリスト
  const [isArticleSearchOpen, setIsArticleSearchOpen] = useState(false);
  const [articleSearchPosition, setArticleSearchPosition] = useState({ top: 0, left: 0 });
  const auth = getAuth();  // authの初期化を追加

  // 既存のタグを取得
  useEffect(() => {
    const fetchExistingTags = async () => {
      const postsRef = demoCollection;
      const querySnapshot = await getDocs(postsRef);
      const tags = new Set(); // 重複を避けるためにSetを使用

      querySnapshot.forEach((doc) => {
        const postTags = doc.data().tags || [];
        postTags.forEach(tag => tags.add(tag));
      });

      setExistingTags(Array.from(tags));
    };

    fetchExistingTags();
  }, []);

  // タグ入力時のサジェスト処理
  const handleTagInputChange = (e) => {
    const input = e.target.value;
    setTagInput(input);

    if (input.trim()) {
      const filtered = existingTags.filter(tag =>
        tag.toLowerCase().includes(input.toLowerCase())
      );
      setSuggestedTags(filtered);
    } else {
      setSuggestedTags([]);
    }
  };

  // サジェストされたタグを選択
  const selectSuggestedTag = (tag) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setTagInput('');
    setSuggestedTags([]);
  };

  // タグを追加する関数
  const addTag = (e) => {
    e.preventDefault();
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput('');
    }
  };

  // タグを削除する関数
  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleArticleLink = (path, title) => {
    editor?.chain().focus().setLink({ 
      href: path,
      target: '_self',
      title: title 
    }).run();
  };

  const getSelectionPosition = () => {
    const bubbleMenu = document.querySelector('.bubble-menu');
    if (!bubbleMenu) return null;

    const rect = bubbleMenu.getBoundingClientRect();
    const editorRect = editor.view.dom.getBoundingClientRect();

    return {
      top: rect.bottom - editorRect.top + window.scrollY,
      left: rect.left - editorRect.left
    };
  };

  const handleOpenArticleSearch = () => {
    const pos = getSelectionPosition();
    if (pos) {
      setArticleSearchPosition(pos);
      setIsArticleSearchOpen(true);
    }
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
          HTMLAttributes: {
            class: 'wiki-heading',
          },
        },
        paragraph: {
          keepMarks: true,
        },
        bulletList: {
          keepMarks: true,
        },
        orderedList: {
          keepMarks: true,
        },
      }),
      Link.configure({
        openOnClick: true,  // クリックでのナビゲーションを有効化
        HTMLAttributes: {
          class: 'article-link',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'wiki-image',
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'wiki-table',
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder: '記事を書く...',
      }),
    ],
    content: initialData?.content || '',
  });

  const onPublish = async () => {
    try {
      if (!title) {
        alert('タイトルを入力してください');
        return;
      }

      const postData = {
        title,
        content: editor.getHTML(),
        tags,
        // 新規投稿の場合のみ以下のフィールドを追加
        ...(!!isEditing ? {} : {
          created_at: new Date().getTime(),
          authorId: auth.currentUser?.uid || 'guest',
          authorName: auth.currentUser?.displayName || 'ゲスト',
          authorPhotoURL: auth.currentUser?.photoURL || '/images/default-avatar.png',
        }),
      };

      if (isEditing && onSave) {
        await onSave(postData);
      } else {
        await addDoc(demoCollection, postData);
        alert('投稿が完了しました！');
        // フォームのリセット
        editor.commands.setContent('');
        setTitle('');
        setTags([]);
      }
    } catch (error) {
      console.error("投稿エラー:", error);
      alert('投稿に失敗しました。もう一度お試しください。');
    }
  };

  return (
    <div className="editor-container">
      {/* タイトル入力欄 */}
      <div className="title-input">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="タイトルを入力..."
          className="title-field"
        />
      </div>

      {/* タグ入力セクション */}
      <div className="tags-section">
        <div className="tags-input">
          <form onSubmit={(e) => {
            e.preventDefault();
            if (tagInput && !tags.includes(tagInput)) {
              setTags([...tags, tagInput]);
              setTagInput('');
              setSuggestedTags([]);
            }
          }}>
            <div className="tag-input-container">
              <input
                type="text"
                value={tagInput}
                onChange={handleTagInputChange}
                placeholder="タグを追加..."
                className="tag-field"
              />
              {suggestedTags.length > 0 && (
                <div className="tag-suggestions">
                  {suggestedTags.map((tag, index) => (
                    <div
                      key={index}
                      className="suggested-tag"
                      onClick={() => selectSuggestedTag(tag)}
                    >
                      {tag}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button type="submit" className="add-tag-button">
              <span className="material-icons">add</span>
            </button>
          </form>
        </div>
        <div className="tags-list">
          {tags.map((tag, index) => (
            <span key={index} className="tag">
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="remove-tag"
              >
                <span className="material-icons">close</span>
              </button>
            </span>
          ))}
        </div>
      </div>

      <MenuBar editor={editor} />
      
      <div className="editor-content">
        <EditorContent editor={editor} />
        
        {editor && (
          <BubbleMenu 
            editor={editor} 
            tippyOptions={{ duration: 100 }}
            className="bubble-menu"
          >
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={editor.isActive('bold') ? 'is-active' : ''}
            >
              <span className="material-icons">format_bold</span>
            </button>
            <button 
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={editor.isActive('italic') ? 'is-active' : ''}
            >
              <span className="material-icons">format_italic</span>
            </button>
            <button 
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={editor.isActive('strike') ? 'is-active' : ''}
            >
              <span className="material-icons">format_strikethrough</span>
            </button>
            <button
              onClick={handleOpenArticleSearch}
              title="記事にリンク"
            >
              <span className="material-icons">article</span>
            </button>
            <button
              onClick={() => {
                const url = window.prompt('URLを入力してください:');
                if (url) {
                  editor.chain().focus().setLink({ href: url }).run();
                }
              }}
              className={editor.isActive('link') ? 'is-active' : ''}
              title="外部リンク"
            >
              <span className="material-icons">link</span>
            </button>
            {editor.isActive('link') && (
              <button
                onClick={() => editor.chain().focus().unsetLink().run()}
                title="リンクを解除"
              >
                <span className="material-icons">link_off</span>
              </button>
            )}
          </BubbleMenu>
        )}
      </div>

      <ArticleSearch
        isOpen={isArticleSearchOpen}
        onClose={() => setIsArticleSearchOpen(false)}
        onSelect={handleArticleLink}
        style={{
          top: `${articleSearchPosition.top}px`,
          left: `${articleSearchPosition.left}px`
        }}
      />

      <button 
        className="publish-button" 
        onClick={onPublish} 
        disabled={isUploading}
      >
        <span className="material-icons">
          {isEditing ? 'save' : 'publish'}
        </span>
        {isEditing ? '保存する' : '公開する'}
      </button>
    </div>
  );
};

export default NewPost;