import axios from "axios";

// Cấu hình cơ bản
const BASE_URL = "https://localhost:5000/api";

export const axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 5000
});
