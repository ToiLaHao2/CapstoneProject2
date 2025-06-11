// src/socket/index.js
import { io } from "socket.io-client"

const BASE_URL = "http://localhost:5000/api";
// const BASE_URL = "http://mywebcapstone.myddns.me:5000/api";
// const BASE_URL = "http://172.16.10.154:5000/api";
// Lưu ý: tách URL realtime khỏi URL REST – dễ chuyển môi trường
const SOCKET_URL = BASE_URL;

let socket = null;

/**
 * Tạo (hoặc trả lại) socket đã tồn tại.
 * @param {string} token - JWT để auth qua middleware server
 */
export function connectSocket(token) {
    if (!socket) {
        socket = io(SOCKET_URL, {
            auth: { token },      // truyền token ngay lần đầu
            autoConnect: false,   // kết nối thủ công → kiểm soát tốt hơn
            transports: ["websocket"], // fallback lên polling nếu WS fail
        });
        // 👉 Đăng ký handler mặc định ở đây nếu muốn (error, reconnect…)
        socket.on("connect_error", (err) => {
            console.error("[socket] connect_error", err.message);
        });
    }
    // token có thể đổi khi refresh → gán lại
    socket.auth = { token };
    socket.connect();
    return socket;
}

export const getSocket = () => socket;
export const disconnectSocket = () => socket?.disconnect();
