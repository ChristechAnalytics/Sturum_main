import API_URL from "../config";

export const getFileUrl = (filePath, token) => {
  if (!filePath || !token) return "";
  const key = filePath.startsWith("gridfs://")
    ? filePath.slice("gridfs://".length)
    : filePath.split("/").pop();
  return `${API_URL}/api/files/${key}?token=${encodeURIComponent(token)}`;
};

export const authFetch = async (url, options = {}, token) => {
  const headers = {
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const response = await fetch(url, { ...options, headers });
  return response;
};

export const refreshAccessToken = async (refreshToken) => {
  const response = await fetch(`${API_URL}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  if (!response.ok) return null;
  return response.json();
};

export const downloadFile = async (filePath, token, filename) => {
  const url = getFileUrl(filePath, token);
  const response = await fetch(url);
  if (!response.ok) throw new Error("Download failed");
  const blob = await response.blob();
  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = filename || "download";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
};
