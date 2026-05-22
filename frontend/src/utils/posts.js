export const mergePost = (prev, post) => {
  const id = post._id?.toString();
  if (!id || prev.some((p) => p._id?.toString() === id)) return prev;
  return [post, ...prev];
};

export const getReshareTarget = (post) => post.reshareOf || post;
