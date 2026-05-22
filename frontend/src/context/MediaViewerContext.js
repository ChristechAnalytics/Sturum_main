import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

const MediaViewerContext = createContext(null);

export const MediaViewerProvider = ({ children }) => {
  const [state, setState] = useState({
    open: false,
    urls: [],
    index: 0,
    alt: "Image",
  });

  const closeViewer = useCallback(() => {
    setState((prev) => ({ ...prev, open: false }));
  }, []);

  const openViewer = useCallback(({ urls, index = 0, alt = "Image" }) => {
    const list = (urls || []).filter(Boolean);
    if (!list.length) return;
    setState({
      open: true,
      urls: list,
      index: Math.min(Math.max(0, index), list.length - 1),
      alt,
    });
  }, []);

  const setIndex = useCallback((index) => {
    setState((prev) => {
      if (!prev.urls.length) return prev;
      const next = ((index % prev.urls.length) + prev.urls.length) % prev.urls.length;
      return { ...prev, index: next };
    });
  }, []);

  const value = useMemo(
    () => ({ ...state, openViewer, closeViewer, setIndex }),
    [state, openViewer, closeViewer, setIndex]
  );

  return (
    <MediaViewerContext.Provider value={value}>
      {children}
    </MediaViewerContext.Provider>
  );
};

export const useMediaViewer = () => {
  const context = useContext(MediaViewerContext);
  if (!context) {
    throw new Error("useMediaViewer must be used within MediaViewerProvider");
  }
  return context;
};

export default MediaViewerContext;
