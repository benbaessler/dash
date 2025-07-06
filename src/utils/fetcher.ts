export const fetcher = async (url: string, token: string) => {
  if (!token) {
    throw new Error("No token provided");
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status}`);
  }
  
  return await response.json();
};
