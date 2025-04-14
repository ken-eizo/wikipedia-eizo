'use client';
import parse from 'html-react-parser';
import DOMPurify from 'dompurify';
import './PostPreview.css';

export default function PostPreview({ content }) {
    // HTML文字列をサニタイズ
    const sanitizedContent = DOMPurify.sanitize(content);

    return (
        <div className="post-preview">
            <div className="preview-content">
                {parse(sanitizedContent)}
            </div>
        </div>
    );
}