import NewPost from './post/NewPost';
import AllPosts from './post/AllPosts';
import Sidebar from './components/Sidebar';
import Searchbar from './components/Searchbar';
import  "./page.css";

export default function Home() {
  return (
    <div className="Home">
      <Sidebar />
      <h1>Wikipedia eizo.mov</h1>
      <Searchbar />
      <AllPosts />
    </div>
  );
}
