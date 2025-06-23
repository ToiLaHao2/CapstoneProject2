import axios from "axios";

// Cấu hình cơ bản
// const BASE_URL = "http://localhost:5000/api";
// const BASE_URL = "http://taskminderstudio.3utilities.com:5000/api";
// const BASE_URL = "http://172.16.10.154:5000/api";
const BASE_URL = "https://capstoneproject2-9mv8.onrender.com";

export const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 5000,
});
