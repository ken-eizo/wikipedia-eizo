import NewPost from './post/NewPost';
import AllPosts from './post/AllPosts';
import  "./page.css";

export default function Home() {
  return (
    <div className="Home">
      <AllPosts />
    </div>
  );
}
