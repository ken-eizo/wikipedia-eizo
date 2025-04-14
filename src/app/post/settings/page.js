import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import db from '../../firebase';

const PostSettings = () => {
    const [tags, setTags] = useState([]);
    const [newTag, setNewTag] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    // 既存のタグを取得
    useEffect(() => {
        fetchTags();
    }, []);

    const fetchTags = async () => {
        try {
            setLoading(true);
            const tagsSnapshot = await getDocs(collection(db, 'tags'));
            const tagsData = tagsSnapshot.docs.map(doc => ({
                id: doc.id,
                name: doc.data().name
            }));
            setTags(tagsData);
        } catch (err) {
            setError('タグの取得に失敗しました');
            console.error('Error fetching tags:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTag = async (e) => {
        e.preventDefault();
        if (!newTag.trim()) return;

        try {
            // タグの重複チェック
            if (tags.some(tag => tag.name === newTag.trim())) {
                setError('このタグは既に存在します');
                return;
            }

            await addDoc(collection(db, 'tags'), {
                name: newTag.trim()
            });
            
            setNewTag('');
            fetchTags(); // タグリストを更新
        } catch (err) {
            setError('タグの追加に失敗しました');
            console.error('Error adding tag:', err);
        }
    };

    const handleDeleteTag = async (tagId) => {
        if (!confirm('このタグを削除してもよろしいですか？')) return;

        try {
            await deleteDoc(doc(db, 'tags', tagId));
            fetchTags(); // タグリストを更新
        } catch (err) {
            setError('タグの削除に失敗しました');
            console.error('Error deleting tag:', err);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">投稿設定</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {/* タグ管理セクション */}
            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">タグ管理</h2>
                
                {/* 新規タグ追加フォーム */}
                <form onSubmit={handleAddTag} className="mb-6">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            placeholder="新しいタグ名"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                        />
                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                        >
                            追加
                        </button>
                    </div>
                </form>

                {/* タグ一覧 */}
                {loading ? (
                    <p>読み込み中...</p>
                ) : (
                    <div className="space-y-2">
                        {tags.map(tag => (
                            <div
                                key={tag.id}
                                className="flex justify-between items-center p-3 bg-gray-50 rounded-md"
                            >
                                <span>{tag.name}</span>
                                <button
                                    onClick={() => handleDeleteTag(tag.id)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    削除
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default PostSettings;