import React, { useEffect } from "react";
import Modal from "react-modal";
import { FaChevronLeft, FaChevronRight, FaTimes } from "react-icons/fa";
import { useMediaViewer } from "../context/MediaViewerContext";

Modal.setAppElement("#root");

const MediaViewer = () => {
  const { open, urls, index, alt, closeViewer, setIndex } = useMediaViewer();
  const hasMultiple = urls.length > 1;
  const currentSrc = urls[index];
  const caption =
    hasMultiple ? `${alt} (${index + 1} of ${urls.length})` : alt;

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (e) => {
      if (e.key === "Escape") closeViewer();
      if (e.key === "ArrowLeft" && hasMultiple) {
        setIndex(index - 1);
      }
      if (e.key === "ArrowRight" && hasMultiple) {
        setIndex(index + 1);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, index, hasMultiple, closeViewer, setIndex]);

  if (!open || !currentSrc) return null;

  return (
    <Modal
      isOpen={open}
      onRequestClose={closeViewer}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 outline-none"
      overlayClassName="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm"
      contentLabel={caption}
      shouldCloseOnOverlayClick
      shouldCloseOnEsc
    >
      <button
        type="button"
        onClick={closeViewer}
        className="absolute top-4 right-4 z-[110] p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        aria-label="Close"
      >
        <FaTimes className="text-2xl" />
      </button>

      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIndex(index - 1);
            }}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-[110] p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Previous image"
          >
            <FaChevronLeft className="text-2xl" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIndex(index + 1);
            }}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-[110] p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Next image"
          >
            <FaChevronRight className="text-2xl" />
          </button>
        </>
      )}

      <div
        className="relative max-w-[min(100%,1200px)] max-h-[90vh] flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={currentSrc}
          alt={caption}
          className="max-w-full max-h-[85vh] w-auto h-auto object-contain rounded-lg shadow-2xl"
        />
        <p className="mt-3 text-sm text-neutral-300 text-center px-4">{caption}</p>
      </div>
    </Modal>
  );
};

export default MediaViewer;
