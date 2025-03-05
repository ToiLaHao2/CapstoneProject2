const express = require("express");
const { validateCreateList, validateGetList, validateUpdateList, validateDeleteList, validateGetCardsInList } = require("../middleware/listMiddleware");
const {
    CreateList,
    GetList,
    UpdateList,
    DeleteList,
    GetCardsInList,
} = require("../controllers/listController");

const listRouter = express.Router();

listRouter.post("/createList", validateCreateList,CreateList);
listRouter.post("/getList",validateGetList,GetList);
listRouter.post("/updateList",validateUpdateList,UpdateList);
listRouter.post("/deleteList",validateDeleteList,DeleteList);
listRouter.post("/getCardsInList",validateGetCardsInList,GetCardsInList);

module.exports = listRouter;
