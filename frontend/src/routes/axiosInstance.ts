import axios from "axios";
import apiConfig from "../api-config";

const instance = axios.create({
  baseURL: `${apiConfig.apiUrl}`,
});

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;
