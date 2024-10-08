const BASE_URL = "https://super-translator.onrender.com"; // API base URL

// Extend RequestInit to include _retry property
interface CustomRequestInit extends RequestInit {
  _retry?: boolean;
}

// Function to request a new access token using the refresh token
const refreshAccessToken = async (): Promise<string> => {
  try {
    const response = await fetch(`${BASE_URL}/api/refresh/accessToken`, {
      method: "POST",
      credentials: "include", // Ensure cookies (including refreshToken) are sent with requests
    });
    if (!response.ok) {
      throw new Error("Failed to refresh access token");
    }
    const data = await response.json();
    const newAccessToken = data.accessToken;
    localStorage.setItem("accessToken", newAccessToken);
    return newAccessToken;
  } catch (error) {
    console.error("Failed to refresh access token:", error);
    throw error;
  }
};

// Custom fetch function to handle token attachment and refresh
const customFetch = async (
  url: string,
  options: CustomRequestInit = {}
): Promise<Response> => {
  const accessToken = localStorage.getItem("accessToken");

  // Attach access token to headers
  const headers = new Headers(options.headers || {});
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  // Update options with headers
  options.headers = headers;
  options.credentials = "include"; // Ensure cookies are sent with requests

  try {
    let response = await fetch(`${BASE_URL}${url}`, options);

    // Handle 403 errors and refresh token if needed
    if (response.status === 403 && !options._retry) {
      options._retry = true;
      const newAccessToken = await refreshAccessToken();
      headers.set("Authorization", `Bearer ${newAccessToken}`);
      options.headers = headers;
      response = await fetch(`${BASE_URL}${url}`, options);
    }

    return response;
  } catch (error) {
    console.error("Fetch Error:", error); // Debugging: Log fetch error
    throw error;
  }
};

export default customFetch;
