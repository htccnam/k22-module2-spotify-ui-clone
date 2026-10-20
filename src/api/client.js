import axios from "axios";
import { BASE_URL } from "../config";

const TOKEN_KEY = "spotify_access_token";
export const api = axios.create({ baseURL: BASE_URL, timeout: 20000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const apiError = error?.response?.data?.error;
    if (apiError) {
      error.apiCode = apiError.code;
      error.message = apiError.message || "Có lỗi xảy ra";
      error.details = apiError.details || [];
    } else if (error.code === "ERR_NETWORK") {
      error.message = "Không thể kết nối tới server";
      error.details = [];
    } else {
      error.message =
        error.response?.data?.message || error.message || "Có lỗi xảy ra";
      error.details = [];
    }
    return Promise.reject(error);
  },
);
