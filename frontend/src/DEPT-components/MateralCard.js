import React from "react";
import API_URL from "../config";

const MaterialCard = ({ title, fileUrl, category, uploadedAt, author }) => {
  // Check if author is an object and access its name property
  const authorName =
    author && typeof author === "object" ? author.name : author;

  return (
    <div className="mb-5 p-6 mx-2 sm:mx-4 bg-white border-2 border-neutral-200 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:border-primary-300">
      <div className="flex items-start justify-between mb-3">
        <h2 className="text-xl font-bold text-neutral-800 flex-1">{title}</h2>
        <span className="ml-3 px-3 py-1 bg-primary-100 text-primary-700 text-xs font-semibold rounded-full">
          {category}
        </span>
      </div>
      {fileUrl && (
        <a
          href={`${API_URL}${fileUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-3 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          Download Material
        </a>
      )}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-gray-600 text-sm">
          <span className="font-semibold">Author:</span> {authorName || "Unknown"}
        </p>
        <p className="text-gray-500 text-xs mt-1">
          Uploaded: {new Date(uploadedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
          })}
        </p>
      </div>
    </div>
  );
};

export default MaterialCard;
