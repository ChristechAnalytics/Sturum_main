const MAX_POST_IMAGES = 10;

const getPostImageUrls = (post) => {
  if (!post) return [];
  if (Array.isArray(post.imageUrls) && post.imageUrls.length > 0) {
    return post.imageUrls.filter(Boolean);
  }
  if (post.imageUrl) return [post.imageUrl];
  return [];
};

const deleteAllPostImages = async (post, deleteFileRef) => {
  const urls = getPostImageUrls(post);
  await Promise.all(urls.map((ref) => deleteFileRef(ref)));
};

module.exports = { MAX_POST_IMAGES, getPostImageUrls, deleteAllPostImages };
