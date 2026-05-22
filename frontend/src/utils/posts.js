export const mergePost = (prev, post) => {
  const id = post._id?.toString();
  if (!id || prev.some((p) => p._id?.toString() === id)) return prev;
  return [post, ...prev];
};

export const getReshareTarget = (post) => post.reshareOf || post;

export const MAX_POST_IMAGES = 10;

/** Normalize legacy single imageUrl and new imageUrls array */
export const getPostImageUrls = (post) => {
  if (!post) return [];
  if (Array.isArray(post.imageUrls) && post.imageUrls.length > 0) {
    return post.imageUrls.filter(Boolean);
  }
  if (post.imageUrl) return [post.imageUrl];
  return [];
};
