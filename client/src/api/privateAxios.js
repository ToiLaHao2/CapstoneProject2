// src/api/privateAxios.js
import { axiosInstance } from "./axiosConfig";

// Thêm Interceptor cho Request có token
axiosInstance.interceptors.request.use(
    config => {
        const token = sessionStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => Promise.reject(error)
);

// Xử lý lỗi Response (ví dụ: token hết hạn)
axiosInstance.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            sessionStorage.removeItem("token");
            window.location.href = "/login"; // Điều hướng về login khi token hết hạn
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
