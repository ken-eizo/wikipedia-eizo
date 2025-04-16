'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { demoCollection } from '../../../firebase';
import { getAuth } from 'firebase/auth';
import Editor from '../../NewPost';

export default function EditPost() {
    const router = useRouter();
    const params = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const auth = getAuth();

    useEffect(() => {
        const fetchPost = async () => {
            if (!params.id) return;
            
            try {
                const docRef = doc(demoCollection, params.id);
                const docSnap = await getDoc(docRef);
                
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (auth.currentUser?.uid !== data.authorId) {
                        alert('編集権限がありません');
                        router.push('/');
                        return;
                    }
                    setPost(data);
                }
            } catch (error) {
                console.error('Error fetching post:', error);
                alert('投稿の取得に失敗しました');
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [params.id, auth.currentUser, router]);

    if (loading) return <div>Loading...</div>;
    if (!post) return <div>投稿が見つかりません</div>;

    return (
        <Editor 
            initialData={post}
            isEditing={true}
            postId={params.id}
            onSave={async (updatedData) => {
                try {
                    await updateDoc(doc(demoCollection, params.id), updatedData);
                    alert('更新しました');
                    router.push(`/post/${params.id}`);
                } catch (error) {
                    console.error('Update error:', error);
                    alert('更新に失敗しました');
                }
            }}
        />
    );
}