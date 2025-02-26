"use client";

import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import db from "../firebase";

const NewPost = () => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            await addDoc(collection(db, "posts"), {
                title:title,
                content:content,
                created_at:new Date().getTime()
            });
            setTitle('')
            setContent('')
        } catch (error) {
            console.log(error);
        }
    };
    return (
        <>
            <p>新規投稿</p>
            <form onSubmit={onSubmit}>
                <input
                type="text"
                value={title}
                placeholder='タイトル'
                onChange={(e) => setTitle(e.target.value)}
                />
                <input
                type="text"
                value={content}
                placeholder='内容'
                onChange={(e) => setContent(e.target.value)}
                />
                <button type='submit'>投稿</button>
            </form>
        </>
    )
}

export default NewPost