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

// Listen
app.listen(port, function () {
    console.log("Your app running on port " + port);
});
