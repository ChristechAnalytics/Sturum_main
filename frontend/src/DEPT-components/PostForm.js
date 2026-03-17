import React, { useState, useRef } from "react";
import { GoFileMedia } from "react-icons/go";
import { MdEvent } from "react-icons/md";
import { useAuthContext } from "../hooks/useAuthContext";

const PostForm = ({ onPost, onClose }) => {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuthContext();
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate text
    if (!text.trim()) {
      setError("Text cannot be empty");
      return;
    }

    // Ensure department is available
    if (!user.department) {
      setError("Department is required");
      return;
    }

    if (isSubmitting) return; // Prevent double submission

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("text", text);
    formData.append("department", user.department);
    if (image) {
      formData.append("image", image);
    }

    try {
      await onPost(formData);
      setText("");
      setImage(null);
      // Close modal after successful post creation
      if (onClose) {
        onClose();
      }
    } catch (err) {
      console.error("Error creating post", err);
      setError(err.message || "Error creating post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
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
        ></textarea>
      </div>
        <div className="flex justify-start items-center pt-4 gap-4">
          <div
            className="flex justify-center items-center px-3 py-2 rounded-lg hover:bg-neutral-100 cursor-pointer transition-colors"
            onClick={triggerFileInput}
          >
            <GoFileMedia className="mr-2 text-xl text-neutral-600" />
            <p className="text-neutral-600 font-medium">Media</p>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageChange}
              className="mb-2"
              style={{ display: "none" }}
            />
          </div>
          <div className="flex justify-center items-center px-3 py-2 rounded-lg hover:bg-neutral-100 cursor-pointer transition-colors">
            <MdEvent className="mr-2 text-xl text-neutral-600" />
            <p className="text-neutral-600 font-medium">Event</p>
          </div>
        </div>

      {image && (
        <div className="mt-2">
          {/* <p className="text-sm text-green-500">Selected file: {image.name}</p> */}
          <img
            src={URL.createObjectURL(image)}
            alt="Preview"
            className="mt-4 w-32 h-32 object-cover rounded-lg border-2 border-neutral-200"
          />
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
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </form>
  );
};

export default PostForm;
