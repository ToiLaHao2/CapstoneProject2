const express = require("express");
const {} = require("../middleware/listMiddleware");
const {
    CreateList,
    GetList,
    UpdateList,
    DeleteList,
    MoveList,
    GetCardsInList,
} = require("../controllers/listController");

const listRouter = express.Router();

module.exports = listRouter;
