// socket.js
const { Server } = require("socket.io");
const { VerifiedToken } = require("../utils/authHelpers");
const { removeSocket, addUser, onlineUsers } = require("../utils/onlineUser");

let io;                                // biến giữ instance toàn cục

/**
 * Khởi tạo Socket.IO – gọi đúng **một lần** trong server.js
 * @param {http.Server} server  instance http.createServer(app)
 */
function initSocket(server) {
    io = new Server(server, {
        cors: { origin: "*" },
        transports: ["websocket", "polling"],
    });

    /* ---- middleware xác thực ngắn gọn ---- */
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token;
        if (!token) return next(new Error("Unauthorized"));
        // TODO: verify token & gắn socket.user
        next();
    });

    /* ---- sự kiện connection ---- */
    io.on("connection", async (socket) => {
        console.log("🔌 New client:", socket.id);
        const getId = await VerifiedToken(socket.handshake.auth.token);
        console.log("👤 User connected:", getId.id);

        // thêm thông tin người dùng vào online users
        addUser(getId.id, socket.id);

        // console.log("🗺️ Online users:", onlineUsers.get("68495e4d83ed810c6b1c33a8"));

        socket.on("disconnect", () => {
            // xoá thông tin người dùng khỏi online users
            removeSocket(socket.id);
            console.log("❌ Client disconnected:", socket.id);
        });
    });

    return io;            // trả về cho server.js nếu cần
}

/** Lấy lại instance io ở bất cứ đâu (controller, service…) */
function getIO() {
    if (!io) throw new Error("Socket.io chưa được khởi tạo!");
    return io;
}

module.exports = { initSocket, getIO };
