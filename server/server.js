const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
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
const { VerifiedToken } = require("./utils/authHelpers");
const { addUser, onlineUsers, removeUser } = require("./utils/onlineUser");
const { initSocket } = require("./sockets");

dotenv.config();

const app = express();
const server = http.createServer(app);

const port = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(bodyparser.json());
// app.use(morgan("dev"));
app.use(morgan(':method :url :status :remote-addr - :response-time ms'));

// app.use(errorHandler);

// Connect database
connectDb();

// Routes
app.get("/", (req, res) => {
    res.send("Welcome to Trello Clone API");
});
app.use("/api/auth", authRouter);
app.use("/api/board", boardRouter);
app.use("/api/user", userRouter);
app.use("/api/list", listRouter);
app.use("/api/card", cardRouter);
app.use("/api/conversation", conversationRouter);
app.use("/api/message", messageRouter);
// app.use("/api/notification");

initSocket(server);

server.listen(port, () =>
    console.log(`🚀 Server is running on port ${port}...`),
);


// app.listen(port, () => {
//     console.log(`Your app running on port ${port}`);
// });

