const Card = require("../models/Card");
const checkList = require("../models/CheckList");
const logger = require("../utils/logger");
const { sendError, sendSuccess } = require("../utils/response");


async function CreateCheckList(req, res) {
    try {
        const { checklist_card_id, checklist_name, user_id } = req.body;
        const isCardExist = await Card.exists({ _id: checklist_card_id });
        if (!isCardExist) {
            return sendError(res, 404, "Card not found");
        }
        if (!checklist_name || checklist_name.trim() === "") {
            return sendError(res, 400, "Checklist name is required");
        }
        const newCheckList = new checkList({
            checklist_card_id: checklist_card_id,
            checklist_name: checklist_name,
            created_by: user_id,
            updated_by: user_id,
        });
        await newCheckList.save();
        // Cập nhật lại card với checklist mới
        await Card.findByIdAndUpdate(checklist_card_id, {
            $push: { card_checklist_id: newCheckList._id },
            $set: { updated_at: new Date(), updated_by: user_id }
        });
        return sendSuccess(201, res, "Checklist created successfully", {
            checklist_id: newCheckList._id,
            checklist_name: newCheckList.checklist_name,
        });
    } catch (error) {
        logger.error("Error creating checklist:", error);
        return sendError(res, 500, "Internal Server Error");
    }
}

// Lấy checkList trong card
async function GetCheckListsInCard(req, res) { }

// Cập nhật checkList trong card (tên, mô tả, thứ tự)
async function UpdateCheckList(req, res) { }

// Xóa checkList khỏi card
async function DeleteCheckList(req, res) { }

// Thêm item vào checkList
async function AddItemToCheckList(req, res) { }
