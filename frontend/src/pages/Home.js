import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import Header from "../DEPT-components/Header";
import { Link } from "react-router-dom";
import PostCard from "../DEPT-components/PostCard";
import NavbarMP from "../DEPT-components/NavbarMP";
import { useAuthContext } from "../hooks/useAuthContext";
import { toast, ToastContainer } from "react-toastify";
import "../styles/Modal.css";
import "react-toastify/dist/ReactToastify.css";
import PostModal from "../DEPT-components/PostModal";

Modal.setAppElement("#root");

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const { user } = useAuthContext();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  // Fetch posts from the API
  const fetchPosts = async () => {
    if (!user?.token) {
      toast.error("User is not authenticated");
      return;
    }

    try {
      const response = await fetch("http://localhost:4000/api/posts", {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.statusText}`);
      }

      const data = await response.json();
      setPosts(data);
      setFilteredPosts(data);
    } catch (error) {
      toast.error(`Error fetching posts: ${error.message}`);
    }
  };

  // Fetch user info
  const fetchUserInfo = async () => {
    if (!user?.token) {
      toast.error("User is not authenticated");
      return;
    }

    try {
      const response = await fetch("http://localhost:4000/api/users/me", {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user info: ${response.statusText}`);
      }

      const data = await response.json();
      setUserInfo(data);
    } catch (error) {
      toast.error(`Error fetching user info: ${error.message}`);
    }
  };

  // Handle posting a new post
  const handlePost = async (formData) => {
    if (!user?.token) {
      toast.error("User is not authenticated");
      return;
    }

    try {
      const response = await fetch("http://localhost:4000/api/posts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Error creating post");
      }

      const newPost = await response.json();
      setPosts((prevPosts) => [newPost, ...prevPosts]);
      setFilteredPosts((prevPosts) => [newPost, ...prevPosts]);
      toast.success("Post created successfully");
    } catch (error) {
      toast.error(`Error creating post: ${error.message}`);
      throw error; // Re-throw so PostForm can handle it
    }
  };

  // Handle search
  const handleSearch = (query) => {
    const filtered = posts.filter((post) =>
      post.text.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredPosts(filtered);
  };

  useEffect(() => {
    fetchPosts();
    if (user) {
      fetchUserInfo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Toggle body scroll lock based on modal state
  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", modalIsOpen);
  }, [modalIsOpen]);

  const profileImage = userInfo?.profileImage
    ? `http://localhost:4000${userInfo.profileImage}`
    : "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50/20 to-neutral-50">
      <Header />
      <NavbarMP onSearch={handleSearch} />
      <div
        className={`pt-[7rem] sm:pt-[7.125rem] md:pt-[8rem] px-4 sm:px-6 mx-auto max-w-[700px] pb-8 ${
          modalIsOpen ? "pointer-events-none" : ""
        }`}
      >
        <div className="mb-5">
          {/* Create a post */}
          <div id="post" className="my-5 p-4 sm:p-6 bg-white border-2 border-neutral-200 rounded-xl shadow-md">
            <div className="flex">
              <Link
                className="flex items-center cursor-pointer rounded-full border-5 border-black mr-3 bg-white"
                to={`/profile/${userInfo?._id}`}
              >
                <img
                  className="rounded-full object-cover border-2 border-neutral-300"
                  src={profileImage}
                  alt="Your profile"
                  style={{ width: "50px", height: "50px" }}
                />
              </Link>
              <div
                className="w-full border-2 border-neutral-300 rounded-full hover:bg-primary-50 hover:border-primary-400 cursor-pointer transition-all duration-300"
                onClick={() => setModalIsOpen(true)}
              >
                <p className="py-2 px-4 text-neutral-600">Start a post</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-b-2 border-neutral-200 mb-5"></div>

        {/* Post card */}
        {filteredPosts.map((post) => (
          <PostCard
            key={post._id}
            _id={post._id}
            text={post.text}
            image={post.imageUrl}
            createdAt={post.createdAt}
            author={post.authorId}
            comments={post.comments}
          />
        ))}


        {/* Modal for PostForm */}
        <PostModal
          isOpen={modalIsOpen}
          onClose={() => setModalIsOpen(false)}
          profileImage={profileImage}
          userInfo={userInfo}
          onPost={handlePost}
        />
      </div>

      <ToastContainer />
    </div>
  );
};

export default Home;
