import React, { useState } from "react";
import Modal from "react-modal";
import { FaTimes } from "react-icons/fa";
import UserAvatar from "../components/UserAvatar";
import EmbeddedPost from "./EmbeddedPost";

Modal.setAppElement("#root");

const ReshareModal = ({
  isOpen,
  onClose,
  currentUser,
  token,
  originalPost,
  onReshare,
}) => {
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onReshare(comment.trim());
      setComment("");
      onClose();
    } catch {
      // error handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setComment("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      overlayClassName="fixed inset-0 bg-black/60 z-40"
    >
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-neutral-200 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
          <h2 className="text-lg font-bold text-neutral-900">Reshare post</h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-neutral-100 text-neutral-500"
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5">
          <div className="flex gap-3 mb-4">
            <UserAvatar
              name={currentUser?.name}
              profileImage={currentUser?.profileImage}
              token={token}
              size={48}
            />
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add your thoughts (optional)…"
              rows={3}
              className="flex-1 border border-neutral-300 rounded-xl px-4 py-3 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:outline-none resize-none"
            />
          </div>

          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
            Original post
          </p>
          <EmbeddedPost post={originalPost} token={token} />

          <div className="flex justify-end gap-2 mt-5">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2.5 rounded-full text-sm font-semibold text-neutral-600 hover:bg-neutral-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-full text-sm font-semibold bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {isSubmitting ? "Sharing…" : "Reshare"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default ReshareModal;
