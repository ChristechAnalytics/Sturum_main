import React, { useState, useRef, useEffect } from "react";
import { GoFileMedia } from "react-icons/go";
import { MdEvent } from "react-icons/md";
import { useAuthContext } from "../hooks/useAuthContext";
import { MAX_POST_IMAGES } from "../utils/posts";

const PostForm = ({ onPost, onClose }) => {
  const [text, setText] = useState("");
  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuthContext();
  const fileInputRef = useRef(null);

  useEffect(() => {
    const urls = images.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [images]);

  const handleImageChange = (e) => {
    const picked = Array.from(e.target.files || []);
    if (!picked.length) return;

    const combined = [...images, ...picked].slice(0, MAX_POST_IMAGES);
    if (images.length + picked.length > MAX_POST_IMAGES) {
      setError(`You can attach up to ${MAX_POST_IMAGES} images per post`);
    } else {
      setError(null);
    }
    setImages(combined);
    e.target.value = "";
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!text.trim()) {
      setError("Text cannot be empty");
      return;
    }

    if (!user.department) {
      setError("Department is required");
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("text", text);
    formData.append("department", user.department);
    images.forEach((file) => formData.append("images", file));

    try {
      await onPost(formData);
      setText("");
      setImages([]);
      if (onClose) onClose();
    } catch (err) {
      console.error("Error creating post", err);
      setError(err.message || "Error creating post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <form className="mt-3" onSubmit={handleSubmit}>
      <div>
        <textarea
          className="w-full p-2 rounded-lg outline-none min-h-[2.4rem]"
          placeholder="What do you want to talk about?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
        />
      </div>
      <div className="flex justify-start items-center pt-4 gap-4 flex-wrap">
        <button
          type="button"
          className="flex justify-center items-center px-3 py-2 rounded-lg hover:bg-neutral-100 cursor-pointer transition-colors border-0 bg-transparent"
          onClick={triggerFileInput}
        >
          <GoFileMedia className="mr-2 text-xl text-neutral-600" />
          <p className="text-neutral-600 font-medium">
            Media {images.length > 0 && `(${images.length}/${MAX_POST_IMAGES})`}
          </p>
        </button>
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          multiple
          onChange={handleImageChange}
          className="hidden"
        />
        <div className="flex justify-center items-center px-3 py-2 rounded-lg text-neutral-400">
          <MdEvent className="mr-2 text-xl" />
          <p className="font-medium text-sm">Event (soon)</p>
        </div>
      </div>

      {previewUrls.length > 0 && (
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
          {previewUrls.map((url, index) => (
            <div key={url} className="relative">
              <img
                src={url}
                alt={`Preview ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg border-2 border-neutral-200"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-neutral-900/70 text-white text-xs w-6 h-6 rounded-full hover:bg-red-600"
                aria-label="Remove image"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end mt-5">
        <button
          className="border-2 border-neutral-400 rounded-lg px-4 py-2 m-0 font-semibold bg-primary-600 hover:bg-primary-700 hover:border-primary-700 duration-300 text-white shadow-md hover:shadow-lg transition-all disabled:bg-neutral-400 disabled:cursor-not-allowed"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Posting..." : "Post"}
        </button>
      </div>
      {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
    </form>
  );
};

export default PostForm;
