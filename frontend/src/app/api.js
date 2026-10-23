import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api/v1",
  withCredentials: true,
});

let accessToken = localStorage.getItem("pourly_access_token");
let refreshing;

export const setAccessToken = (token) => {
  accessToken = token;
  if (token) localStorage.setItem("pourly_access_token", token);
  else localStorage.removeItem("pourly_access_token");
};

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status !== 401 || original._retry || original.url?.includes("/auth/refresh")) {
      return Promise.reject(error);
    }
    original._retry = true;
    refreshing ||= api.post("/auth/refresh").then(({ data }) => {
      setAccessToken(data.data.accessToken);
      return data.data.accessToken;
    }).catch((refreshError) => {
      setAccessToken(null);
      throw refreshError;
    }).finally(() => { refreshing = null; });
    const token = await refreshing;
    original.headers.Authorization = `Bearer ${token}`;
    return api(original);
  },
);

export const apiMessage = (error) => error.response?.data?.message || "Something went wrong. Please try again.";
export default api;
