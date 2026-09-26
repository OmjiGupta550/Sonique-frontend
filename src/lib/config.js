const DEFAULT_PROD_API_URL = "https://sonique-backend-4joz.onrender.com";

const getApiUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && envUrl.includes("sonique-backend-uyd4")) {
    return DEFAULT_PROD_API_URL;
  }
  if (envUrl && envUrl.trim() !== "") {
    return envUrl;
  }
  if (process.env.NODE_ENV === "production") {
    return DEFAULT_PROD_API_URL;
  }
  return "http://localhost:5000";
};

export const API_URL = getApiUrl();
export const API_BASE = `${API_URL}/api`;

