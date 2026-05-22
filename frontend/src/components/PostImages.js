import React from "react";
import { getFileUrl } from "../utils/api";
import { useMediaViewer } from "../context/MediaViewerContext";

const PostImages = ({ imageUrls, token, className = "", maxHeight = "500px" }) => {
  const { openViewer } = useMediaViewer();

  if (!imageUrls?.length || !token) return null;

  const sources = imageUrls
    .map((ref) => getFileUrl(ref, token))
    .filter(Boolean);

  if (!sources.length) return null;

  const openAt = (index) => {
    openViewer({ urls: sources, index, alt: "Post" });
  };

  const imageButtonClass =
    "block w-full p-0 border-0 bg-transparent cursor-zoom-in rounded-lg overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900";

  if (sources.length === 1) {
    return (
      <div className={className}>
        <button type="button" className={imageButtonClass} onClick={() => openAt(0)}>
          <img
            className="w-full rounded-lg object-cover hover:opacity-95 transition-opacity"
            style={{ maxHeight }}
            src={sources[0]}
            alt="Post"
          />
        </button>
      </div>
    );
  }

  return (
    <div
      className={`grid gap-2 ${sources.length === 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3"} ${className}`}
    >
      {sources.map((src, index) => (
        <button
          key={`${src}-${index}`}
          type="button"
          className={imageButtonClass}
          onClick={() => openAt(index)}
        >
          <img
            src={src}
            alt={`Post ${index + 1} of ${sources.length}`}
            className="w-full rounded-lg object-cover aspect-square hover:opacity-95 transition-opacity"
            style={{ maxHeight: sources.length > 2 ? "220px" : maxHeight }}
          />
        </button>
      ))}
    </div>
  );
};

export default PostImages;
