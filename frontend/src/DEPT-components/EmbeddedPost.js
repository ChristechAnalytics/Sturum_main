import React from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import UserAvatar from "../components/UserAvatar";
import PostImages from "../components/PostImages";
import { getPostImageUrls } from "../utils/posts";

const EmbeddedPost = ({ post, token }) => {
  if (!post) return null;

  const author = post.authorId;
  const imageUrls = getPostImageUrls(post);

  return (
    <div className="mt-3 border border-neutral-200 rounded-lg bg-neutral-50 overflow-hidden">
      {author && (
        <div className="flex items-center gap-2 px-3 pt-3 pb-1">
          <Link to={`/profile/${author._id}`}>
            <UserAvatar
              name={author.name}
              profileImage={author.profileImage}
              token={token}
              size={32}
            />
          </Link>
          <div className="min-w-0 text-xs">
            <Link
              to={`/profile/${author._id}`}
              className="font-semibold text-neutral-900 hover:text-primary-700 hover:underline"
            >
              {author.name}
            </Link>
            <p className="text-neutral-500 truncate">
              {author.department}
              {author.academicLevel != null &&
                ` · Level ${author.academicLevel === 600 ? "Graduate" : author.academicLevel}`}
            </p>
          </div>
        </div>
      )}
      <div className="px-3 pb-3">
        {post.text && (
          <p className="text-sm text-neutral-800 whitespace-pre-wrap line-clamp-4">
            {post.text}
          </p>
        )}
        {imageUrls.length > 0 && (
          <div className="mt-2">
            <PostImages imageUrls={imageUrls} token={token} maxHeight="256px" />
          </div>
        )}
        <p className="text-[11px] text-neutral-400 mt-2">
          {format(new Date(post.createdAt), "MMM d, yyyy")}
        </p>
      </div>
    </div>
  );
};

export default EmbeddedPost;
