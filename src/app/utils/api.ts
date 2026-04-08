// Get the API base URL from environment or fallback to relative path for local dev
export const getApiUrl = () => {
  return import.meta.env.VITE_API_URL || '';
};

export const apiCall = async (endpoint: string, options?: RequestInit) => {
  const url = `${getApiUrl()}${endpoint}`;
  return fetch(url, options);
};
