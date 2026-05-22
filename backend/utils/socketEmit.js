const emitToDepartment = (io, department, event, payload) => {
  if (!io || !department) return;
  io.to(`department:${department}`).emit(event, payload);
};

const serializeComment = (comment) => {
  if (!comment) return null;
  if (typeof comment.toObject === "function") {
    return comment.toObject();
  }
  return comment;
};

module.exports = { emitToDepartment, serializeComment };
