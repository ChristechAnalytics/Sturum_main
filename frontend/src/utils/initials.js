/**
 * First letter of first name + first letter of last name.
 * Single-word names use the first two letters (or one if length 1).
 */
export const getInitials = (name) => {
  if (!name || typeof name !== "string") return "?";

  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) {
    const word = parts[0];
    return word.length >= 2
      ? (word[0] + word[1]).toUpperCase()
      : word[0].toUpperCase();
  }

  const first = parts[0][0];
  const last = parts[parts.length - 1][0];
  return `${first}${last}`.toUpperCase();
};
