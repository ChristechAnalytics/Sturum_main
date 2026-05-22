import React from "react";
import { getFileUrl } from "../utils/api";

const PostImages = ({ imageUrls, token, className = "", maxHeight = "500px" }) => {
  if (!imageUrls?.length || !token) return null;

  const sources = imageUrls
    .map((ref) => getFileUrl(ref, token))
    .filter(Boolean);

  if (!sources.length) return null;

  if (sources.length === 1) {
    return (
      <div className={className}>
        <img
          className="w-full rounded-lg object-cover"
          style={{ maxHeight }}
          src={sources[0]}
          alt="Post"
        />
      </div>
    );
  }

  return (
    <div
      className={`grid gap-2 ${sources.length === 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3"} ${className}`}
    >
      {sources.map((src, index) => (
        <img
          key={`${src}-${index}`}
          src={src}
          alt={`Post ${index + 1} of ${sources.length}`}
          className="w-full rounded-lg object-cover aspect-square"
          style={{ maxHeight: sources.length > 2 ? "220px" : maxHeight }}
        />
      ))}
    </div>
  );
};

export default PostImages;
