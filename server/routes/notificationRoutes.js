const express = require("express");
const { GetNotifications, MarkNotificationRead, MarkAllRead } = require("../controllers/notificationController");
const { validateGetNotification, validateMarkNotiRead, validateAllNotiRead } = require("../middleware/notificationMiddleware");

const notificationRouter = express.Router();

notificationRouter.post("/getNotification", validateGetNotification, GetNotifications);
notificationRouter.post("/markNotificatioRead", validateMarkNotiRead, MarkNotificationRead);
notificationRouter.post("/markAllRead", validateAllNotiRead, MarkAllRead);

module.exports = notificationRouter;

