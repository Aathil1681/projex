import axios from "axios";
import Cookie from "js-cookie";
import { cookieKeys } from "../../config/cookie.config";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

//apply the changes before the request fulfil
api.interceptors.request.use(
  (config) => {
    const token = Cookie.get(cookieKeys.USER_TOKEN) || "";
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export default api;
