import React, { useState, useEffect } from "react";
import { IoMdGlobe, IoMdRepeat } from "react-icons/io";
import { FaEdit, FaTrash } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import { format } from "date-fns";
import { toast } from "react-toastify";
import API_URL from "../config";
import { getReshareTarget, getPostImageUrls } from "../utils/posts";
import PostImages from "../components/PostImages";
import UserAvatar from "../components/UserAvatar";
import PostComments from "./PostComments";
import EmbeddedPost from "./EmbeddedPost";
import ReshareModal from "./ReshareModal";
import { PANEL_SM, TEXT_BODY, TEXT_HEADING, TEXT_SUBTLE } from "../theme/classes";

const PostCard = ({
  text,
  image,
  imageUrls,
  createdAt,
  _id,
  author,
  authorId,
  reshareOf,
  currentUser,
  onDeleted,
  onUpdated,
  onReshared,
}) => {
  const { user } = useAuthContext();
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text);
  const [postText, setPostText] = useState(text);
  const [reshareModalOpen, setReshareModalOpen] = useState(false);
  const [hasReshared, setHasReshared] = useState(false);

  const currentUserId = user?._id || user?.userId;
  const postAuthorId = authorId || author?._id;
  const isAuthor =
    postAuthorId &&
    currentUserId &&
    postAuthorId.toString() === currentUserId.toString();

  const isReshare = Boolean(reshareOf);
  const originalForReshare = isReshare
    ? getReshareTarget(reshareOf)
    : { _id, text, imageUrl: image, authorId: author, createdAt };
  const reshareTargetId = originalForReshare._id?.toString() || _id;

  const viewer =
    currentUser ||
    (user
      ? {
          _id: currentUserId,
          name: user.name,
          profileImage: user.profileImage,
        }
      : null);

  const formattedDate = format(new Date(createdAt), "MMMM d, h:mm a");
  const postImageUrls = !isReshare
    ? imageUrls?.length
      ? imageUrls
      : getPostImageUrls({ imageUrl: image, imageUrls })
    : [];

  const fetchComments = async () => {
    if (!user) return;

    try {
      const response = await fetch(`${API_URL}/api/posts/${_id}/comments`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (!response.ok) throw new Error(`Failed to fetch comments`);
      const data = await response.json();
      setLikes(data.likes);
      setComments(data.comments || []);

      if (data.likedUsers) {
        const userHasLiked = data.likedUsers.some(
          (id) => id.toString() === currentUserId?.toString()
        );
        setHasLiked(userHasLiked);
      }
    } catch (error) {
      toast.error(`Error fetching comments: ${error.message}`);
    }
  };

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_id]);

  useEffect(() => {
    setPostText(text);
    setEditText(text);
  }, [text]);

  useEffect(() => {
    if (!user?.token || !reshareTargetId) return;

    const checkReshared = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/posts/${reshareTargetId}/reshare-status`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        if (!response.ok) return;
        const data = await response.json();
        setHasReshared(Boolean(data.hasReshared));
      } catch {
        // ignore
      }
    };

    checkReshared();
  }, [user?.token, reshareTargetId, currentUserId]);

  const handleLike = async () => {
    if (!user) return;

    try {
      const response = await fetch(`${API_URL}/api/posts/${_id}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to like post");
      const { likes: updatedLikes } = await response.json();
      setLikes(updatedLikes);
      setHasLiked((prev) => !prev);
    } catch (error) {
      toast.error(`Error liking post: ${error.message}`);
    }
  };

  const handleReshare = async (comment) => {
    const response = await fetch(
      `${API_URL}/api/posts/${reshareTargetId}/reshare`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ comment }),
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.msg || "Failed to reshare");
    }

    const newPost = await response.json();
    setHasReshared(true);
    onReshared?.(newPost);
    toast.success("Post reshared to your feed");
  };

  const handleUpdate = async () => {
    if (!editText.trim() && !isReshare) return;
    try {
      const response = await fetch(`${API_URL}/api/posts/${_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ text: editText }),
      });
      if (!response.ok) throw new Error("Failed to update post");
      const updated = await response.json();
      setPostText(updated.text);
      setIsEditing(false);
      onUpdated?.(updated);
      toast.success("Post updated");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this post?")) return;
    try {
      const response = await fetch(`${API_URL}/api/posts/${_id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (!response.ok) throw new Error("Failed to delete post");
      onDeleted?.(_id);
      toast.success("Post deleted");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className={`my-5 ${PANEL_SM} transition-shadow duration-300 overflow-hidden`}>
      {isReshare && (
        <div className={`flex items-center gap-2 px-4 sm:px-6 pt-3 text-xs ${TEXT_SUBTLE} font-medium`}>
          <IoMdRepeat className="text-base text-primary-600" />
          <span>
            <Link
              to={`/profile/${author._id}`}
              className={`font-semibold ${TEXT_BODY} hover:text-primary-700 dark:hover:text-primary-400 hover:underline`}
            >
              {author.name}
            </Link>{" "}
            reshared this
          </span>
        </div>
      )}

      {author ? (
        <div className="flex justify-between items-start px-4 sm:px-6 pt-4 pb-2">
          <div className="flex items-start">
            <Link
              to={`/profile/${author._id}`}
              className="hover:opacity-90 transition-opacity mr-3 shrink-0"
            >
              <UserAvatar
                name={author.name}
                profileImage={author.profileImage}
                token={user?.token}
                size={48}
              />
            </Link>
            <div className="text-sm min-w-0">
              <Link to={`/profile/${author._id}`}>
                <h3 className={`font-semibold ${TEXT_HEADING} hover:text-primary-700 dark:hover:text-primary-400 hover:underline leading-tight`}>
                  {author.name}
                </h3>
              </Link>
              <p className="text-xs text-neutral-500 mt-0.5 line-clamp-2">
                {author.department} · Level{" "}
                {author.academicLevel === 600 ? "Graduate" : author.academicLevel}
              </p>
              <p className="flex items-center text-xs text-neutral-500 mt-0.5">
                {formattedDate}
                <span className="mx-1">·</span>
                <IoMdGlobe className="text-sm" aria-label="Public" />
              </p>
            </div>
          </div>
          {isAuthor && (
            <div className="flex gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setIsEditing((v) => !v)}
                className="p-2 text-neutral-500 dark:text-neutral-400 hover:text-primary-600 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700"
                aria-label="Edit post"
              >
                <FaEdit />
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="p-2 text-neutral-500 hover:text-red-600 rounded-full hover:bg-neutral-100"
                aria-label="Delete post"
              >
                <FaTrash />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="px-4 sm:px-6 pt-4 text-neutral-500">Loading...</div>
      )}

      <div className="px-4 sm:px-6 pb-2">
        {isEditing ? (
          <div>
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              placeholder={isReshare ? "Edit your reshare comment…" : "Edit post…"}
              className="w-full border border-neutral-300 dark:border-neutral-600 rounded-lg p-3 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:border-primary-500 focus:ring-1 focus:ring-primary-200 dark:focus:ring-primary-900"
              rows={3}
            />
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={handleUpdate}
                className="bg-primary-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-primary-700"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditText(postText);
                }}
                className="bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 px-4 py-2 rounded-full text-sm font-semibold hover:bg-neutral-200 dark:hover:bg-neutral-600"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            {postText && (
              <p className={`${TEXT_BODY} text-[15px] leading-relaxed whitespace-pre-wrap mb-2`}>
                {postText}
              </p>
            )}
            {isReshare && reshareOf && (
              <EmbeddedPost post={reshareOf} token={user?.token} />
            )}
          </>
        )}
      </div>

      {!isReshare && postImageUrls.length > 0 && (
        <div className="px-4 sm:px-6 pb-3">
          <PostImages imageUrls={postImageUrls} token={user?.token} />
        </div>
      )}

      <PostComments
        postId={_id}
        token={user?.token}
        currentUser={viewer}
        likes={likes}
        hasLiked={hasLiked}
        onLike={handleLike}
        onReshare={() => setReshareModalOpen(true)}
        hasReshared={hasReshared}
        comments={comments}
        setComments={setComments}
      />

      <ReshareModal
        isOpen={reshareModalOpen}
        onClose={() => setReshareModalOpen(false)}
        currentUser={viewer}
        token={user?.token}
        originalPost={originalForReshare}
        onReshare={handleReshare}
      />
    </div>
  );
};

export default PostCard;
