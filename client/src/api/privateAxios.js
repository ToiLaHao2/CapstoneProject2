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
            const originalRequest = error.config;

            // Nếu là lỗi từ `/auth/login`, không tự logout
            if (originalRequest.url.includes("/auth/login")) {
                return Promise.reject(error); // ✅ Giữ nguyên lỗi để frontend xử lý
            }

            // Nếu không phải `/auth/login`, tức là token hết hạn → Logout
            sessionStorage.removeItem("token");
            window.location.href = "/login";
        }

        return Promise.reject(error.response ? error : new Error(error)); // ✅ Giữ nguyên `error.response`
    }
);

export default axiosInstance;
