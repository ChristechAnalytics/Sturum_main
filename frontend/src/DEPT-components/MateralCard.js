import React from "react";
import { FaTrash } from "react-icons/fa";
import { useAuthContext } from "../hooks/useAuthContext";
import { downloadFile } from "../utils/api";

const MaterialCard = ({
  _id,
  title,
  fileUrl,
  category,
  uploadedAt,
  author,
  authorId,
  onDelete,
}) => {
  const { user } = useAuthContext();
  const authorName = author && typeof author === "object" ? author.name : author;
  const currentUserId = user?._id || user?.userId;
  const isAuthor =
    authorId &&
    currentUserId &&
    authorId.toString() === currentUserId.toString();

  const handleDownload = async () => {
    try {
      await downloadFile(fileUrl, user.token, title);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <div className="mb-5 p-6 mx-2 sm:mx-4 bg-white border-2 border-neutral-200 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:border-primary-300">
      <div className="flex items-start justify-between mb-3">
        <h2 className="text-xl font-bold text-neutral-800 flex-1">{title}</h2>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-primary-100 text-primary-700 text-xs font-semibold rounded-full">
            {category}
          </span>
          {isAuthor && (
            <button
              onClick={() => onDelete(_id)}
              className="p-2 text-neutral-500 hover:text-red-600 rounded-lg hover:bg-neutral-100"
              aria-label="Delete material"
            >
              <FaTrash />
            </button>
          )}
        </div>
      </div>
      {fileUrl && (
        <button
          onClick={handleDownload}
          className="inline-block mt-3 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          Download Material
        </button>
      )}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-gray-600 text-sm">
          <span className="font-semibold">Author:</span> {authorName || "Unknown"}
        </p>
        <p className="text-gray-500 text-xs mt-1">
          Uploaded:{" "}
          {new Date(uploadedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </p>
      </div>
    </div>
  );
};

export default MaterialCard;
