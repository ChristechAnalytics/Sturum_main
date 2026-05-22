/** Build top-level comments with nested replies (newest parent first, replies oldest first). */
export const buildCommentThreads = (comments) => {
  const list = comments || [];
  const topLevel = list.filter((c) => !c.parentComment);
  const replies = list.filter((c) => c.parentComment);

  const repliesByParent = replies.reduce((acc, reply) => {
    const parentId = reply.parentComment?.toString?.() || String(reply.parentComment);
    if (!acc[parentId]) acc[parentId] = [];
    acc[parentId].push(reply);
    return acc;
  }, {});

  Object.values(repliesByParent).forEach((arr) => {
    arr.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  });

  return topLevel
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((comment) => ({
      ...comment,
      replies: repliesByParent[comment._id?.toString()] || [],
    }));
};

export const countAllComments = (comments) => (comments || []).length;

export const userLikedComment = (comment, userId) => {
  if (!userId || !comment?.likes?.length) return false;
  const uid = userId.toString();
  return comment.likes.some((id) => id.toString() === uid);
};

/** Add a comment from the API or socket without duplicates. */
export const mergeComment = (prev, comment) => {
  const id = comment._id?.toString();
  if (!id || prev.some((c) => c._id?.toString() === id)) return prev;
  return [...prev, comment];
};
