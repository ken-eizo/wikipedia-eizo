import "../post/page.css";
import NewPost from '../post/NewPost';
import AllPosts from '../post/AllPosts';

export default function PostPage() {
    return (
        <div className='Home'>
            <h1>Post Pageです</h1>
            <NewPost />
        </div>
    )
}