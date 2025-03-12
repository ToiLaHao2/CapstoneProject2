const express = require("express");
const {
    validateCreateCard,
    validateGetCard,
    validateUpdateCard,
    validateMoveCard,
    validateAssignUserToCard,
    validateRemoveUserFromCard,
} = require("../middleware/cardMiddleware");
const {
    CreateCard,
    GetCard,
    UpdateCard,
    MoveCard,
    AssignUserToCard,
    RemoveUserFromCard,
} = require("../controllers/cardController");

const cardRouter = express.Router();

cardRouter.post("/createCard", validateCreateCard, CreateCard);
cardRouter.post("/getCard", validateGetCard, GetCard);
cardRouter.post("/updateCard", validateUpdateCard, UpdateCard);
cardRouter.post("/moveCard", validateMoveCard, MoveCard);
cardRouter.post(
    "/assignUserToCard",
    validateAssignUserToCard,
    AssignUserToCard
);
cardRouter.post(
    "/removeUserFromCard",
    validateRemoveUserFromCard,
    RemoveUserFromCard
);

module.exports = cardRouter;
