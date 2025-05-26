const express = require("express");
const {
    validateCreateCard,
    validateGetCard,
    validateUpdateCard,
    validateMoveCard,
    validateAssignUserToCard,
    validateRemoveUserFromCard,
    validateAddAttachmentsToCard,
    validateRemoveAttachmentsFromCard,
    validateGetAttachmentFromCard,
    validateMoveCardWithPosition,
} = require("../middleware/cardMiddleware");
const {
    CreateCard,
    GetCard,
    UpdateCard,
    MoveCard,
    AssignUserToCard,
    RemoveUserFromCard,
    AddAttachmentToCard,
    GetAttachmentInCard,
    MoveCardWithPosition
} = require("../controllers/cardController");

const cardRouter = express.Router();

cardRouter.post("/createCard", validateCreateCard, CreateCard);
cardRouter.post("/getCard", validateGetCard, GetCard);
cardRouter.post("/updateCard", validateUpdateCard, UpdateCard);
cardRouter.post("/moveCard", validateMoveCard, MoveCard);
cardRouter.post("/moveCardWithDragAndDrop", validateMoveCardWithPosition, MoveCardWithPosition);
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
cardRouter.post(
    "/addAttachmentToCard",
    validateAddAttachmentsToCard,
    AddAttachmentToCard
);
cardRouter.post(
    "/removeAttachmentFromCard",
    validateRemoveAttachmentsFromCard,
    RemoveUserFromCard
);
cardRouter.post(
    "/getAttachmentInCard",
    validateGetAttachmentFromCard,
    GetAttachmentInCard
);

module.exports = cardRouter;
