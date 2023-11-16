import Layout from "./components/Layout";
import Home from "./components/Home";
import NewPost from "./components/NewPost";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  //useNavigate,
} from "react-router-dom";
import PostPage from "./components/PostPage";
import Missing from "./components/Missing";
import About from "./components/About";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import axios from "./api/axios";
import EditPost from "./components/EditPost";
//import { useHistory } from "react-router-dom";

/*const ROLES = {
  "User": 2023,
  "Editor": 2022,
  "Admin" : 2021
}*/

function App() {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [postTitle, setPostTitle] = useState("");
  const [postBody, setPostBody] = useState([]);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  //const navigate = useNavigate();
  //const history = useHistory();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get("/posts");
        setPosts(response.data);
      } catch (err) {
        // Not in the 200 response range
        if (err.message) {
          // axios documentation about response schema
          console.log(err.response.data);
          console.log(err.response.status);
          console.log(err.response.headers);
        } else {
          console.log(`Error: ${err.message}`);
        }
      }
    };
    fetchPosts();
  }, []);

  useEffect(() => {
    const filteredResults = posts.filter(
      (post) =>
        post.body.toLowerCase().includes(search.toLowerCase()) ||
        post.title.toLowerCase().includes(search.toLowerCase())
    );

    setSearchResults(filteredResults.reverse());
  }, [posts, search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (posts && posts.length) {
      const id = posts.length ? posts[posts.length - 1].id + 1 : 1;
      const datetime = format(new Date(), "MMMM dd, yyyy pp");
      const newPost = { id, title: postTitle, datetime, body: postBody };

      try {
        const response = await axios.post("/posts", newPost);
        const allPosts = [...posts, response.data];
        setPosts(allPosts);
        setPostTitle("");
        setPostBody("");
        //navigate("/");
        //history.push("/");
      } catch (err) {
        console.log(`Error: ${err.message}`);
      }
    }
  };

  const handleDelete = (id) => {
    const postsList = posts.filter((post) => post.id !== id);
    setPosts(postsList);
    //navigate("/");
  };

  const handleEdit = async (id) => {
    const datetime = format(new Date(), "MMMM dd, yyyy pp");
    const updatedPost = { id, title: editTitle, datetime, body: editBody };
    try {
      const response = await axios.put(`/posts/${id}`, updatedPost);
      setPosts(
        posts.map((post) => (post.id === id ? { ...response.data } : post))
      );
      setEditTitle("");
      setEditBody("");
      //history.push("/")
    } catch (err) {
      console.log(`Error: ${err.message}`);
    }
  };

  return (
    <div className="App">
      <Router>
        <Routes>
          <Route
            path="/"
            element={<Layout search={search} setSearch={setSearch} />}
          >
            <Route index element={<Home posts={searchResults} />} />
            <Route path="post">
              <Route
                index
                element={
                  <NewPost
                    handleSubmit={handleSubmit}
                    postTitle={postTitle}
                    setPostTitle={setPostTitle}
                    postBody={postBody}
                    setPostBody={setPostBody}
                  />
                }
              />
              <Route
                path=":id"
                element={<PostPage posts={posts} handleDelete={handleDelete} />}
              />
            </Route>
            <Route
              path="/post/:id/edit"
              element={
                <Route
                  index
                  element={
                    <EditPost
                      posts={posts}
                      handleEdit={handleEdit}
                      setEditTitle={setEditTitle}
                      setEditBody={setEditBody}
                    />
                  }
                />
              }
            />
            <Route path="about" element={<About />} />
            <Route path="*" element={<Missing />} />
          </Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
