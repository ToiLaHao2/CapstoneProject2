const express = require('express');
const {} = require('../controllers/cardController');
const { validateCreateCard } = require('../middleware/cardMiddleware');

const cardRouter = express.Router();

cardRouter.post("/createCard", validateCreateCard, );

module.exports = cardRouter;
