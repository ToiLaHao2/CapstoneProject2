const express = require("express");
const cors = require("cors");
const bodyparser = require("body-parser");
const dotenv = require("dotenv");

const errorHandler = require("./middleware/errorHandler");
const { connectDb } = require("./configs/dbConfig");
const authRouter = require("./routes/authRoutes");
const boardRouter = require("./routes/boardRoutes");
const userRouter = require("./routes/userRoutes");
const listRouter = require("./routes/listRoutes");
const cardRouter = require("./routes/cardRoutes");
const morgan = require("morgan");
const conversationRouter = require("./routes/convsersationRoutes");
const messageRouter = require("./routes/messageRoutes");

dotenv.config();

const app = express();
const port = process.env.PORT;

// Middlewares
app.use(cors());
app.use(bodyparser.json());
// app.use(morgan("dev"));
app.use(morgan(':method :url :status :remote-addr - :response-time ms'));

// app.use(errorHandler);

// Connect database
connectDb();

// Routes
app.use("/api/auth", authRouter);
app.use("/api/board", boardRouter);
app.use("/api/user", userRouter);
app.use("/api/list", listRouter);
app.use("/api/card", cardRouter);
app.use("/api/conversation", conversationRouter);
app.use("/api/message", messageRouter);
app.use("/api/notification");

// ---------- Tạo HTTP server & Socket.IO ----------
const server = http.createServer(app);   // ⬅️ dùng http thay cho app.listen
const io = new Server(server, {
    cors: {
        origin: "*",            // tùy chỉnh origin cho production
        methods: ["GET", "POST"]
    }
});

/**
 * Hàm tiện dụng để in log — giúp “hình dung” rõ các bước kết nối.
 */
const log = (msg) => console.log(`[Socket] ${msg}`);

// ---------- Lắng nghe kết nối ----------
io.on("connection", (socket) => {
    log(`${socket.id} connected`);

    // 1. Client join vào “phòng” (mỗi conversation ~ một room)
    socket.on("joinConversation", ({ conversationId, userId }) => {
        socket.join(conversationId);
        log(`${socket.id} joined room ${conversationId}`);
        // Bạn có thể kiểm tra quyền, lưu trạng thái đang online, v.v.
    });

    // 2. Client gửi tin nhắn
    socket.on("sendMessage", async ({ conversationId, message }) => {
        // Lưu DB qua messageRouter/service nếu cần
        // await Message.create({ conversationId, sender: socket.id, text: message });

        // Phát cho *tất cả* client khác trong phòng
        socket.to(conversationId).emit("receiveMessage", {
            conversationId,
            message,
        });
        log(`${socket.id} sent message to ${conversationId}`);
    });

    // 3. Rời phòng (tùy chọn)
    socket.on("leaveConversation", (conversationId) => {
        socket.leave(conversationId);
        log(`${socket.id} left room ${conversationId}`);
    });

    // Ngắt kết nối
    socket.on("disconnect", () => {
        log(`${socket.id} disconnected`);
    });
});

// ---------- Khởi chạy ----------
server.listen(port, () => {
    console.log(`Your app running on port ${port}`);
});

