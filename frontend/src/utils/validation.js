/** Basic email format check (backend also validates with validator). */
export const isValidEmail = (email) => {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed || trimmed.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed);
};

export const normalizeEmail = (email) => email.trim().toLowerCase();

export const passwordsMatch = (password, confirmPassword) =>
  password.length > 0 && password === confirmPassword;

export const getPasswordHint = (password) => {
  if (password.length < 8) return "At least 8 characters required";
  if (!/[a-z]/.test(password)) return "Include a lowercase letter";
  if (!/[A-Z]/.test(password)) return "Include an uppercase letter";
  if (!/[0-9]/.test(password)) return "Include a number";
  if (!/[^A-Za-z0-9]/.test(password)) return "Include a symbol (e.g. !@#$)";
  return null;
};
