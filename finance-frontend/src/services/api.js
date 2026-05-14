import axios from "axios";

/* ================= AXIOS INSTANCE ================= */

const API = axios.create({
  baseURL: "http://127.0.0.1:5000/api",
  withCredentials: false, // ❗ IMPORTANT (avoid CORS issue)
});

/* ================= REQUEST INTERCEPTOR ================= */
/* Attach token automatically EXCEPT LOGIN */

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    // DO NOT attach token while logging in
    if (token && !config.url.includes("/auth/login")) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* ================= RESPONSE INTERCEPTOR ================= */
/* Auto logout if token expired */

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // token invalid or expired
      localStorage.clear();
      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);

export default API;
