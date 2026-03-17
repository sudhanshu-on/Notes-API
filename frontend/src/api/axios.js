import axios from "axios";

const API = axios.create({
  baseURL: "https://notes-api-production-cd96.up.railway.app",
});

// We add an "interceptor" to automatically attach the token if it exists
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
