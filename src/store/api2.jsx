// src/store/api.js
import axios from "axios";
 
// Ganti sesuai URL backend Laravel kamu
const api2 = axios.create({
  baseURL: "http://localhost:8000", // misal: http://127.0.0.1:8000
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
    // referer: "http://localhost:3000"
  },
});

api2.defaults.withCredentials = true;
api2.defaults.withXSRFToken = true;

api2.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // contoh logout otomatis
      localStorage.removeItem("auth-storage");
      window.location.href = "/signin";
    }
    return Promise.reject(error);
  }
);

export default api2;