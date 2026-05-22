import React, { useState, useEffect } from "react";
import { getFileUrl } from "../utils/api";
import { getInitials } from "../utils/initials";

const UserAvatar = ({
  name = "",
  profileImage,
  token,
  size = 50,
  className = "",
  alt,
  imgClassName = "rounded-full object-cover",
}) => {
  const [imgError, setImgError] = useState(false);
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

  if (src) {
    return (
      <img
        src={src}
        alt={displayAlt}
        className={`${imgClassName} ${className}`}
        style={sizeStyle}
        onError={() => setImgError(true)}
      />
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
