"use client";

import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import db from "../firebase";
import  "./NewPost.css";

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
        <div className="PostEdit">
            <form onSubmit={onSubmit}>
                <div className="edit">
                    <a className="NewPostTitle">新規投稿</a>
                    <div >
                        <label>タイトル</label>
                    <input
                    type="text" className="imput"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    />
                    </div>
                    <div>
                        <label>内容</label>
                    <textarea
                    type="text" className="imput imput-content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    />
                    </div>
                <button type='submit' className="submit-button">投稿</button>
                </div>
            </form>
        </div>
    )
}

export default NewPost