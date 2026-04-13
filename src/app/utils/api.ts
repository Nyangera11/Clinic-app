// Get the API base URL from environment or fallback to relative path for local dev
export const getApiUrl = () => {
  return import.meta.env.VITE_API_URL || '';
};

export const apiCall = async (endpoint: string, options?: RequestInit) => {
  const token = localStorage.getItem('authToken');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options?.headers,
  };
  const url = `${getApiUrl()}${endpoint}`;
  return fetch(url, { ...options, headers });
};
