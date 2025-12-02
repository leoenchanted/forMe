export const fetchUnsplash = async (endpoint, params = {}, apiKey) => {
  if (!apiKey) return null;
  try {
    const queryParams = new URLSearchParams({ ...params, client_id: apiKey }).toString();
    const response = await fetch(`https://api.unsplash.com${endpoint}?${queryParams}`);
    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    return null;
  }
};