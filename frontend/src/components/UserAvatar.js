import React, { useState, useEffect } from "react";
import { getFileUrl } from "../utils/api";
import { getInitials } from "../utils/initials";
import { useMediaViewer } from "../context/MediaViewerContext";

const UserAvatar = ({
  name = "",
  profileImage,
  token,
  size = 50,
  className = "",
  alt,
  imgClassName = "rounded-full object-cover",
  viewable = true,
}) => {
  const [imgError, setImgError] = useState(false);
  const { openViewer } = useMediaViewer();
  const initials = getInitials(name);
  const displayAlt = alt || (name ? `${name}'s profile` : "Profile");

  const src =
    profileImage && token && !imgError
      ? getFileUrl(profileImage, token)
      : null;

  useEffect(() => {
    setImgError(false);
  }, [profileImage, token]);

  const sizeStyle = { width: size, height: size, minWidth: size, minHeight: size };
  const canView = viewable && Boolean(src);

  const handleImageClick = (e) => {
    if (!canView) return;
    e.preventDefault();
    e.stopPropagation();
    openViewer({ urls: [src], alt: displayAlt });
  };

  if (src) {
    return (
      <span
        role={canView ? "button" : undefined}
        tabIndex={canView ? 0 : undefined}
        onClick={canView ? handleImageClick : undefined}
        onKeyDown={
          canView
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleImageClick(e);
                }
              }
            : undefined
        }
        className={`inline-flex shrink-0 rounded-full ${
          canView ? "cursor-zoom-in hover:opacity-90" : ""
        } ${className}`}
        style={sizeStyle}
        aria-label={canView ? `View ${displayAlt}` : undefined}
      >
        <img
          src={src}
          alt={displayAlt}
          className={`${imgClassName} w-full h-full`}
          style={{ width: size, height: size }}
          onError={() => setImgError(true)}
          draggable={false}
        />
      </span>
    );
  }

  const fontSize = Math.max(10, Math.round(size * 0.36));

  return (
    <div
      className={`rounded-full flex items-center justify-center bg-primary-600 text-white font-semibold select-none shrink-0 ${className}`}
      style={{ ...sizeStyle, fontSize }}
      role="img"
      aria-label={displayAlt}
    >
      {initials}
    </div>
  );
};

export default UserAvatar;
