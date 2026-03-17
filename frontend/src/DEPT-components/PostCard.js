import React, { useState, useEffect } from "react";
import { IoMdGlobe, IoIosSend } from "react-icons/io";
import { AiFillLike } from "react-icons/ai";
import { FcLike } from "react-icons/fc";
import { FaHeart, FaCommentDots } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import { format } from "date-fns";
import { toast } from "react-toastify";
import API_URL from "../config";

const PostCard = ({ text, image, createdAt, _id, author }) => {
  const { user } = useAuthContext();
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [showCommentForm, setShowCommentForm] = useState(false);

  // Format the date
  const formattedDate = format(new Date(createdAt), "MMMM d, h:mm a");

  // Fetch post comments
  const fetchComments = async () => {
    if (!user) {
      toast.error("User not authenticated");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/posts/${_id}/comments`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch comments: ${response.statusText}`);
      }
      const data = await response.json();
      setLikes(data.likes);
      setComments(data.comments);
      
      // Check if current user has liked the post
      if (user && data.likedUsers) {
        const userId = user._id || user.userId;
        const userHasLiked = data.likedUsers.some(
          (id) => id.toString() === userId?.toString()
        );
        setHasLiked(userHasLiked);
      } else if (user) {
        // If likedUsers not provided, default to false
        setHasLiked(false);
      }
    } catch (error) {
      toast.error(`Error fetching comments: ${error.message}`);
    }
  };
  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_id]);

  const handleLike = async () => {
    if (!user) {
      console.error("User not authenticated");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/posts/${_id}/like`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to like the post: ${response.statusText}`);
      }

      const { likes: updatedLikes } = await response.json();
      setLikes(updatedLikes);
      // Toggle like status
      setHasLiked((prev) => !prev);
      // Refresh comments to get updated like status
      fetchComments();
    } catch (error) {
      toast.error(`Error liking post: ${error.message}`);
    }
  };

  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();

    if (!user) {
      console.error("User not authenticated");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/posts/${_id}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({ text: comment }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to add comment: ${response.statusText}`);
      }

      const newComment = await response.json();
      setComments((prevComments) => [newComment, ...prevComments]);
      setComment(""); // Clear the comment input field
    } catch (error) {
      console.error("Error adding comment:", error.message);
    }
  };

  return (
    <div className="my-5 py-4 bg-white border-2 border-neutral-200 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
      <div>
        {/* Profile section */}
        {author ? (
          <div className="flex justify-start items-center px-4 sm:px-6 mb-3">
            <Link to={`/profile/${author._id}`} className="hover:opacity-80 transition-opacity">
              <img
                className="rounded-full mr-3 object-cover bg-neutral-100 border-2 border-neutral-300"
                src={
                  author.profileImage
                    ? `${API_URL}${author.profileImage}`
                    : ""
                }
                alt={`${author.name}'s profile`}
                style={{ width: "50px", height: "50px" }}
              />
            </Link>
            <div className="text-xs sm:text-sm">
              <Link to={`/profile/${author._id}`}>
                <h3 className="font-bold text-neutral-800 hover:text-primary-600 transition-colors">
                  {author.name}
                </h3>
              </Link>
              <p className="text-neutral-600">
                {author.department} | Level {author.academicLevel === 600 ? "Graduate" : author.academicLevel}
              </p>
              <p className="flex items-center text-neutral-500 text-xs">
                {formattedDate}
                <span className="ml-1">
                  <IoMdGlobe className="text-sm" />
                </span>
              </p>
            </div>
          </div>
        ) : (
          <div className="px-4 sm:px-6 text-neutral-500">Loading...</div>
        )}

        {/* Text post */}
        <div className="my-3 px-4 sm:px-6">
          <p className="text-neutral-800 leading-relaxed whitespace-pre-wrap">{text}</p>
        </div>

        {/* Picture post */}
        {image && (
          <div className="px-4 sm:px-6 mb-3">
            <img
              className="mx-0 w-full rounded-lg object-cover max-h-[500px]"
              src={`${API_URL}${image}`}
              alt="Post content"
            />
          </div>
        )}

        {/* Total reaction section */}
        <div className="flex justify-between items-center my-2 mx-4 border-b-2 border-neutral-200 mb-5 pb-2">
          <button
            onClick={handleLike}
            className="flex text-3xl items-center"
            aria-label={hasLiked ? "Unlike this post" : "Like this post"}
          >
            {hasLiked ? (
              <FcLike className="text-primary-600 rounded-full p-[3px]" />
            ) : (
              <FaHeart className="text-neutral-400 rounded-full p-1" />
            )}
            <p className={`ml-[1rem] text-[1rem] ${hasLiked ? 'text-primary-600 font-semibold' : 'text-neutral-600'}`}>{likes}</p>
          </button>

          <div className="flex text-[1rem] mx-4">
            <p className="pr-4">{comments.length} comments</p>
          </div>
        </div>

        {/* Reaction and repost section */}
        <div className="flex justify-between mx-4 sm:mx-8 px-4 py-2 border-t border-neutral-200 text-sm">
          <button
            onClick={handleLike}
            className="flex items-center justify-center px-4 py-2 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <AiFillLike className={`text-2xl mr-1 ${hasLiked ? 'text-primary-600' : 'text-neutral-600'}`} /> 
            <span className={hasLiked ? 'text-primary-600 font-semibold' : 'text-neutral-600'}>Like</span>
          </button>
          <button
            onClick={() => setShowCommentForm((prev) => !prev)}
            className="flex items-center justify-center px-4 py-2 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <FaCommentDots className="text-2xl text-neutral-600 mr-1" /> 
            <span className="text-neutral-600">Comment</span>
          </button>
          <button className="flex items-center justify-center px-4 py-2 rounded-lg hover:bg-neutral-100 transition-colors">
            <IoIosSend className="text-2xl text-neutral-600 mr-1" /> 
            <span className="text-neutral-600">Send</span>
          </button>
        </div>

        {showCommentForm && (
          <form
            id={`comment-form-${_id}`}
            className="mx-8 mt-5"
            onSubmit={handleAddComment}
          >
            <input
              type="text"
              value={comment}
              onChange={handleCommentChange}
              placeholder="Add a comment"
              className="border-2 border-neutral-300 rounded-full w-full py-2 px-4 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
            />
            <button
              type="submit"
              className="mt-3 ml-0 bg-primary-600 hover:bg-primary-700 duration-300 text-white font-medium py-1 px-2 rounded-lg mr-0 shadow-md hover:shadow-lg transition-all"
            >
              <IoIosSend className="text-2xl text-white mr-1" />
            </button>
          </form>
        )}

        {/* Comments section */}
        <div className="mt-5">
          {comments.map((comment) => (
            <div key={comment._id} className="flex items-center mx-8 mb-3">
              <img
                className="rounded-full mr-2 object-cover border-2 border-neutral-200"
                src={
                  comment.user.profileImage
                    ? `${API_URL}${comment.user.profileImage}`
                    : ""
                }
                alt={`${comment.user.name}'s profile`}
                style={{ width: "30px", height: "30px" }}
              />
              <div className="bg-neutral-50 border border-neutral-200 p-3 rounded-lg flex-1">
                <h4 className="font-bold text-neutral-800 mb-1">{comment.user.name}</h4>
                <p className="text-neutral-700">{comment.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PostCard;
