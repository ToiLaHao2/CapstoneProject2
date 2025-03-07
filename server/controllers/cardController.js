import Card from '../models/cardModel.js';
import List from '../models/listModel.js';
import Board from '../models/boardModel.js';
import User from '../models/userModel.js';
import { sendError, sendSuccess } from '../utils/response.js';

async function CreateCard(req,res) {
    const {user_id,board_id,list_id,card_title,card_numerical_order} = req.body;
    // check if user is a member of the board
    const board = await Board.findById(board_id);
    if (!board) {
        return sendError(res, 404, "Board not found");
    }
    if (!board.members.includes(user_id)) {
        if (board.created_by !== user_id) {
            return sendError(res, 403, "User is not a member of the board");
        }
    }
    // check if list exists
    const list = await List.findById(list_id);
    if (!list) {
        return sendError(res, 404, "List not found");
    }
    // check if list in board   
    if (list.board_id !== board_id) {
        return sendError(res, 403, "List does not belong to the board");
    }
    // check if card_numerical_order is valid
    if (card_numerical_order < 0 || card_numerical_order > list.list_cards.length) {
        return sendError(res, 400, "Invalid card_numerical_order");
    }
    // create new card
    const newCard = new Card({
        card_title : card_title,
        created_by: user_id,
    });
    const card = await newCard.save();
    // add card to list
    list.list_cards.;
}

async function GetCard(req,res) {
}

async function UpdateCard(req,res) {}

async function DeleteCard(req,res) {}

async function MoveCard(req,res) {}

async function AssignUserToCard(req,res) {}

async function RemoveUserFromCard(req,res) {}

async function AddAttachmentToCard(req,res) {}

async function AddCommentToCard(req,res) {}

async function GetCommentsInCard(req,res) {}

async function AssignLabelToCard(req,res) {}

// Lưu trữ card không còn hoạt động
async function ArchiveCard(params) {}

async function UpdateCheckListsInCard(req,res) {}
