/** Phone numbers must stay as strings so leading zeros (e.g. 080…) are preserved. */
const normalizeContact = (value) => {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (!digits) {
    throw new Error("Contact number is required");
  }
  if (!/^\d{7,15}$/.test(digits)) {
    throw new Error("Contact number must be 7–15 digits");
  }
  return digits;
};

module.exports = { normalizeContact };
