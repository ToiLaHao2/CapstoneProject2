const express = require("express");
const cors = require("cors");
const bodyparser = require("body-parser");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const port = process.env.PORT;

// Middlewares
app.use(cors());
app.use(bodyparser.json());

// Connect database

// Routes

// Listen
