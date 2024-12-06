const express = require("express");
const cors = require("cors");
const bodyparser = require("body-parser");
const dotenv = require("dotenv");

const errorHandler = require("./middleware/errorHandler");
const { connectDb } = require("./configs/dbConfig");
const authRouter = require("./routes/authRoutes");
const boardRouter = require("./routes/boardRoutes");

dotenv.config();

const app = express();
const port = process.env.PORT;

// Middlewares
app.use(cors());
app.use(bodyparser.json());

// app.use(errorHandler);

// Connect database
connectDb();

// Routes
app.use("/api/auth", authRouter);
app.use("/api/board", boardRouter);

// Listen
app.listen(port, function () {
  console.log("Your app running on port " + port);
});
