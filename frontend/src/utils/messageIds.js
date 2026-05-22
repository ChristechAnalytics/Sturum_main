/** Normalize user/message id fields (ObjectId string or populated { _id }). */
export const toIdString = (value) => {
  if (value == null) return null;
  if (typeof value === "object" && value._id != null) {
    return String(value._id);
  }
  return String(value);
};

export const messageBelongsToChat = (message, currentUserId, chatPartnerId) => {
  const senderId = toIdString(message.senderId ?? message.sender);
  const receiverId = toIdString(message.receiverId ?? message.receiver);
  const userId = toIdString(currentUserId);
  const partnerId = toIdString(chatPartnerId);

  if (!senderId || !receiverId || !userId || !partnerId) return false;

  return (
    (senderId === userId && receiverId === partnerId) ||
    (receiverId === userId && senderId === partnerId)
  );
};

export const appendMessage = (prevMessages, message) => {
  const exists = prevMessages.some(
    (msg) =>
      msg._id === message._id ||
      (msg.text === message.text &&
        Math.abs(new Date(msg.createdAt) - new Date(message.createdAt)) < 2000)
  );
  if (exists) return prevMessages;
  return [...prevMessages, message];
};
