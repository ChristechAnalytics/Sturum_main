import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { AiFillLike } from "react-icons/ai";
import { FaCommentDots, FaRetweet } from "react-icons/fa";
import { FcLike } from "react-icons/fc";
import UserAvatar from "../components/UserAvatar";
import { formatLinkedInTime } from "../utils/time";
import {
  buildCommentThreads,
  countAllComments,
  userLikedComment,
  mergeComment,
} from "../utils/comments";
import API_URL from "../config";
import { toast } from "react-toastify";
import { useSocket } from "../context/SocketContext";

const PREVIEW_COUNT = 2;

const getCommentUserId = (comment) =>
  comment.user?._id?.toString() || comment.user?.toString();

const CommentItem = ({
  comment,
  token,
  currentUserId,
  postId,
  onCommentLike,
  onStartReply,
  replyingToId,
  replyText,
  onReplyTextChange,
  onSubmitReply,
  isSubmittingReply,
  isNested = false,
}) => {
  const name = comment.user?.name || comment.userName || "User";
  const userId = getCommentUserId(comment);
  const department = comment.user?.department;
  const level = comment.user?.academicLevel;
  const likeCount = comment.likes?.length || 0;
  const hasLiked = userLikedComment(comment, currentUserId);
  const isReplyingHere = replyingToId === comment._id?.toString();

  const subtitle = department
    ? `${department}${level ? ` · Level ${level === 600 ? "Graduate" : level}` : ""}`
    : null;

  return (
    <div className={isNested ? "ml-10 sm:ml-12" : ""}>
      <div className="flex gap-2 sm:gap-3 py-2">
        <Link to={userId ? `/profile/${userId}` : "#"} className="shrink-0">
          <UserAvatar
            name={name}
            profileImage={comment.user?.profileImage || comment.userProfileImage}
            token={token}
            size={isNested ? 32 : 40}
          />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="bg-neutral-100 hover:bg-neutral-100/80 rounded-2xl px-3 py-2.5 transition-colors">
            <Link
              to={userId ? `/profile/${userId}` : "#"}
              className="font-semibold text-sm text-neutral-900 hover:text-primary-700 hover:underline"
            >
              {name}
            </Link>
            {subtitle && (
              <p className="text-xs text-neutral-500 leading-tight mt-0.5">{subtitle}</p>
            )}
            <p className="text-sm text-neutral-800 mt-1 whitespace-pre-wrap break-words leading-snug">
              {comment.text}
            </p>
          </div>
          <div className="flex items-center gap-3 mt-1 ml-1 flex-wrap">
            <span className="text-xs font-semibold text-neutral-500">
              {formatLinkedInTime(comment.createdAt)}
            </span>
            <button
              type="button"
              onClick={() => onCommentLike(comment._id)}
              className={`text-xs font-semibold flex items-center gap-1 ${
                hasLiked
                  ? "text-primary-700"
                  : "text-neutral-500 hover:text-primary-700"
              }`}
            >
              {hasLiked ? (
                <FcLike className="text-sm" />
              ) : (
                <AiFillLike className="text-sm" />
              )}
              {likeCount > 0 ? (
                <span>
                  {likeCount} {likeCount === 1 ? "Like" : "Likes"}
                </span>
              ) : (
                <span>Like</span>
              )}
            </button>
            <button
              type="button"
              onClick={() => onStartReply(comment)}
              className="text-xs font-semibold text-neutral-500 hover:text-primary-700"
            >
              Reply
            </button>
          </div>

          {isReplyingHere && (
            <form
              onSubmit={(e) => onSubmitReply(e, comment._id)}
              className="mt-3 flex gap-2 items-start"
            >
              <input
                type="text"
                value={replyText}
                onChange={(e) => onReplyTextChange(e.target.value)}
                placeholder={`Reply to ${name}…`}
                autoFocus
                className="flex-1 text-sm border border-neutral-300 rounded-full py-2 px-4 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:outline-none bg-white"
              />
              <button
                type="submit"
                disabled={!replyText.trim() || isSubmittingReply}
                className="text-sm font-semibold text-primary-700 hover:bg-primary-50 disabled:text-neutral-400 px-3 py-2 rounded-full"
              >
                {isSubmittingReply ? "…" : "Post"}
              </button>
              <button
                type="button"
                onClick={() => onStartReply(null)}
                className="text-sm font-semibold text-neutral-500 hover:text-neutral-700 px-2 py-2"
              >
                Cancel
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

const CommentThread = (props) => {
  const { thread, ...itemProps } = props;
  return (
    <div>
      <CommentItem comment={thread} {...itemProps} />
      {thread.replies?.map((reply) => (
        <CommentItem
          key={reply._id}
          comment={reply}
          {...itemProps}
          isNested
        />
      ))}
    </div>
  );
};

const PostComments = ({
  postId,
  token,
  currentUser,
  likes,
  hasLiked,
  onLike,
  onReshare,
  hasReshared,
  comments,
  setComments,
}) => {
  const [showComments, setShowComments] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const inputRef = useRef(null);
  const { socket } = useSocket();

  const currentUserId = currentUser?._id || currentUser?.userId;
  const postIdStr = postId?.toString();
  const totalComments = countAllComments(comments);
  const threads = buildCommentThreads(comments);
  const visibleThreads = showAllComments
    ? threads
    : threads.slice(0, PREVIEW_COUNT);
  const hiddenCount = Math.max(0, threads.length - PREVIEW_COUNT);

  const openComments = () => {
    setShowComments(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  useEffect(() => {
    if (!socket || !postIdStr) return;

    const onPostComment = ({ postId: eventPostId, comment }) => {
      if (eventPostId !== postIdStr) return;
      setComments((prev) => mergeComment(prev, comment));
      setShowAllComments(true);
    };

    const onCommentLike = ({ postId: eventPostId, commentId, likes }) => {
      if (eventPostId !== postIdStr) return;
      setComments((prev) =>
        prev.map((c) =>
          c._id?.toString() === commentId ? { ...c, likes: likes || [] } : c
        )
      );
    };

    socket.on("post_comment", onPostComment);
    socket.on("post_comment_like", onCommentLike);

    return () => {
      socket.off("post_comment", onPostComment);
      socket.off("post_comment_like", onCommentLike);
    };
  }, [socket, postIdStr, setComments]);

  const updateCommentInList = (commentId, updater) => {
    setComments((prev) =>
      prev.map((c) =>
        c._id?.toString() === commentId?.toString() ? updater(c) : c
      )
    );
  };

  const handleCommentLike = async (commentId) => {
    if (!token) return;
    try {
      const response = await fetch(
        `${API_URL}/api/posts/${postId}/comments/${commentId}/like`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error("Failed to like comment");
      const data = await response.json();

      updateCommentInList(commentId, (c) => {
        const uid = currentUserId?.toString();
        let newLikes = [...(c.likes || [])];
        if (data.liked) {
          if (!newLikes.some((id) => id.toString() === uid)) {
            newLikes.push(currentUserId);
          }
        } else {
          newLikes = newLikes.filter((id) => id.toString() !== uid);
        }
        return { ...c, likes: newLikes };
      });
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleStartReply = (comment) => {
    if (!comment) {
      setReplyingTo(null);
      setReplyText("");
      return;
    }
    setShowComments(true);
    setReplyingTo({
      id: comment._id?.toString(),
      name: comment.user?.name || comment.userName,
    });
    setReplyText("");
  };

  const postComment = async (text, parentCommentId = null) => {
    const response = await fetch(`${API_URL}/api/posts/${postId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        text: text.trim(),
        ...(parentCommentId ? { parentCommentId } : {}),
      }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.msg || "Failed to add comment");
    }
    return response.json();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !token || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const newComment = await postComment(commentText);
      setComments((prev) => mergeComment(prev, newComment));
      setCommentText("");
      setShowComments(true);
      setShowAllComments(true);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReply = async (e, parentCommentId) => {
    e.preventDefault();
    if (!replyText.trim() || !token || isSubmittingReply) return;

    setIsSubmittingReply(true);
    try {
      const newReply = await postComment(replyText, parentCommentId);
      setComments((prev) => mergeComment(prev, newReply));
      setReplyText("");
      setReplyingTo(null);
      setShowAllComments(true);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const threadProps = {
    token,
    currentUserId,
    postId,
    onCommentLike: handleCommentLike,
    onStartReply: handleStartReply,
    replyingToId: replyingTo?.id,
    replyText,
    onReplyTextChange: setReplyText,
    onSubmitReply: handleSubmitReply,
    isSubmittingReply,
  };

  return (
    <>
      {(likes > 0 || totalComments > 0) && (
        <div className="flex items-center justify-between px-4 sm:px-6 py-2 text-xs text-neutral-500">
          <button
            type="button"
            onClick={onLike}
            className="flex items-center gap-1 hover:text-primary-700 hover:underline"
          >
            {likes > 0 && (
              <>
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary-600 text-white">
                  <FcLike className="text-[10px]" />
                </span>
                <span className="font-medium text-neutral-600">{likes}</span>
              </>
            )}
          </button>
          {totalComments > 0 && (
            <button
              type="button"
              onClick={openComments}
              className="font-medium hover:text-primary-700 hover:underline"
            >
              {totalComments} comment{totalComments !== 1 ? "s" : ""}
            </button>
          )}
        </div>
      )}

      <div className="flex items-center justify-around border-t border-neutral-200 mx-4 sm:mx-6 py-1">
        <button
          type="button"
          onClick={onLike}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-colors hover:bg-neutral-100 ${
            hasLiked ? "text-primary-700" : "text-neutral-600"
          }`}
        >
          {hasLiked ? <FcLike className="text-lg" /> : <AiFillLike className="text-lg" />}
          Like
        </button>
        <button
          type="button"
          onClick={() => (showComments ? inputRef.current?.focus() : openComments())}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold text-neutral-600 hover:bg-neutral-100 transition-colors"
        >
          <FaCommentDots className="text-lg" />
          Comment
        </button>
        <button
          type="button"
          onClick={onReshare}
          disabled={hasReshared}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-colors hover:bg-neutral-100 ${
            hasReshared
              ? "text-primary-700 cursor-default"
              : "text-neutral-600"
          }`}
          title={hasReshared ? "You already reshared this" : "Reshare to your feed"}
        >
          <FaRetweet className="text-lg" />
          {hasReshared ? "Reshared" : "Reshare"}
        </button>
      </div>

      {showComments && (
        <div className="px-4 sm:px-6 pb-4 border-t border-neutral-100 bg-neutral-50/50">
          <form onSubmit={handleSubmit} className="flex gap-2 sm:gap-3 pt-4 pb-2">
            <UserAvatar
              name={currentUser?.name}
              profileImage={currentUser?.profileImage}
              token={token}
              size={40}
              className="shrink-0"
            />
            <div className="flex-1 flex flex-col gap-2">
              <div
                className={`flex items-center rounded-full border bg-white transition-all ${
                  inputFocused
                    ? "border-primary-500 ring-2 ring-primary-100"
                    : "border-neutral-300"
                }`}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  placeholder="Add a comment…"
                  className="flex-1 bg-transparent rounded-full py-2.5 pl-4 pr-2 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none"
                />
              </div>
              {(commentText.trim() || inputFocused) && (
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!commentText.trim() || isSubmitting}
                    className="px-4 py-1.5 text-sm font-semibold text-primary-700 hover:bg-primary-50 disabled:text-neutral-400 disabled:hover:bg-transparent rounded-full transition-colors"
                  >
                    {isSubmitting ? "Posting…" : "Post"}
                  </button>
                </div>
              )}
            </div>
          </form>

          {!showAllComments && hiddenCount > 0 && (
            <button
              type="button"
              onClick={() => setShowAllComments(true)}
              className="flex items-center gap-2 py-2 text-sm font-semibold text-neutral-600 hover:text-primary-700 hover:bg-neutral-100/80 rounded-lg w-full px-2 -ml-2"
            >
              <span className="w-10 border-t border-neutral-300" />
              Load {hiddenCount} more comment{hiddenCount !== 1 ? "s" : ""}
            </button>
          )}

          {visibleThreads.length > 0 ? (
            <div className="space-y-0.5">
              {visibleThreads.map((thread) => (
                <CommentThread key={thread._id} thread={thread} {...threadProps} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-500 py-2 pl-12">Be the first to comment</p>
          )}

          {showAllComments && threads.length > PREVIEW_COUNT && (
            <button
              type="button"
              onClick={() => setShowAllComments(false)}
              className="text-sm font-semibold text-neutral-600 hover:text-primary-700 mt-2 ml-12"
            >
              Show less
            </button>
          )}
        </div>
      )}

      {!showComments && threads.length > 0 && (
        <div className="px-4 sm:px-6 pb-4">
          <CommentThread thread={threads[0]} {...threadProps} />
          {totalComments > 1 && (
            <button
              type="button"
              onClick={openComments}
              className="text-sm font-semibold text-neutral-600 hover:text-primary-700 mt-1 ml-12"
            >
              View all {totalComments} comments
            </button>
          )}
        </div>
      )}
    </>
  );
};

export default PostComments;
