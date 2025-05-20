import axios from "axios";

// Cấu hình cơ bản
// const BASE_URL = "http://localhost:5000/api";
const BASE_URL = "http://mywebcapstone.myddns.me:5000/api";

export const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 5000,
});
