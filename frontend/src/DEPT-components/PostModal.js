import React from "react";
import Modal from "react-modal";
import { FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";
import PostForm from "../DEPT-components/PostForm";
import UserAvatar from "../components/UserAvatar";

const PostModal = ({ isOpen, onClose, userInfo, token, onPost }) => (
  <Modal
    isOpen={isOpen}
    onRequestClose={onClose}
    className="fixed inset-0 flex items-center justify-center z-50"
    overlayClassName="fixed inset-0 bg-black bg-opacity-75 z-40"
  >
    <div
      className="w-full mx-auto max-w-lg p-6 bg-white rounded-2xl shadow-2xl border-2 border-neutral-200"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex justify-between">
        <div className="flex justify-start items-center">
          <Link to={`/profile/${userInfo?._id}`}>
            <UserAvatar
              name={userInfo?.name}
              profileImage={userInfo?.profileImage}
              token={token}
              size={50}
              className="mr-2 border-2 border-neutral-300"
            />
          </Link>
          <div className="text-[14px]">
            <h3 className="font-bold text-neutral-800">{userInfo?.name}</h3>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-[20px] cursor-pointer hover:text-red-500 transition-colors p-2 rounded-full hover:bg-neutral-100"
          aria-label="Close modal"
        >
          <FaTimes />
        </button>
      </div>

      <div>
        <PostForm onPost={onPost} onClose={onClose} />
      </div>
    </div>
  </Modal>
);

export default PostModal;
