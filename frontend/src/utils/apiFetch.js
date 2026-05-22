const DEFAULT_TIMEOUT_MS = 90_000;

/**
 * fetch with timeout (Render free tier cold start can take ~30–60s).
 */
export const apiFetch = async (url, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error(
        "The server took too long to respond. It may be waking up — wait 30 seconds and try again."
      );
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const parseJsonResponse = async (response) => {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }
  await response.text();
  throw new Error(
    response.ok
      ? "Invalid server response"
      : `Server error (${response.status}). Try again in a moment.`
  );
};
