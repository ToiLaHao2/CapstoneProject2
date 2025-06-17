import React, { createContext, useContext, useState } from "react";
import privateAxios from "../api/privateAxios";
import { useEffect } from "react";
import { useSocket } from "./SocketContext";

const CardContext = createContext();

export const useCard = () => useContext(CardContext);

export const CardProvider = ({ children }) => {
    const [cards, setCards] = useState([]);
    const { socket, connected } = useSocket();

    // create card
    const createCard = async (boardId, listId, cardTitle) => {
        try {
            const response = await privateAxios.post("/card/createCard", {
                board_id: boardId,
                list_id: listId,
                card_title: cardTitle,
                card_duration: Date.now(),
                card_description: "",
                checkMessage: "Create new card",
            });

            const data = response.data;
            console.log("Created card:", data);

            if (data.success) {
                return data.data;
            } else {
                console.error("Failed to create card:", data.message);
                return null;
            }
        } catch (error) {
            console.error("Error creating card:", error);
            return null;
        }
    };

    // get card
    const getCard = async (boardId, listId, cardId) => {
        try {
            const response = await privateAxios.post("/card/getCard", {
                board_id: boardId,
                list_id: listId,
                card_id: cardId,
                checkMessage: "Get card",
            });

            const data = response.data;
            console.log("Fetched card:", data);

            if (data.success) {
                return data.data;
            } else {
                console.error("Failed to fetch card:", data.message);
                return null;
            }
        } catch (error) {
            console.error("Error fetching card:", error);
            return null;
        }
    };

    // update card
    const updateCard = async (boardId, listId, cardId, cardUpdateDetails) => {
        try {
            const response = await privateAxios.post("/card/updateCard", {
                board_id: boardId,
                list_id: listId,
                card_id: cardId,
                card_update_details: cardUpdateDetails,
                // ...cardUpdateDetails,
                checkMessage: "Update card",
            });

            const data = response.data;

            if (data.success) {
                console.log("Received updated card data:", data.data);

                setCards((prevCards) => {
                    return prevCards.map((card) => {
                        if (card._id === cardId) {
                            return { ...card, ...cardUpdateDetails };
                        }
                        return card;
                    });
                });
                return data.data;
            } else {
                console.error("Failed to update card:", data.message);
                return null;
            }
        } catch (error) {
            console.error("Error updating card:", error);
            return null;
        }
    };

    // assign user to card
    const assignUserToCard = async (boardId, listId, cardId, assignUserId) => {
        try {
            const response = await privateAxios.post("/card/assignUserToCard", {
                board_id: boardId,
                list_id: listId,
                card_id: cardId,
                assign_user_id: assignUserId,
                checkMessage: "Assign user to card",
            });

            const data = response.data;
            console.log("Assigned user to card:", data);

            if (data.success) {
                return data.data;
            } else {
                console.error("Failed to assign user to card:", data.message);
                return null;
            }
        } catch (error) {
            console.error("Error assigning user to card:", error);
            return null;
        }
    };

    // remove user from card
    const removeUserFromCard = async (boardId, listId, cardId, removeUserId) => {
        try {
            const response = await privateAxios.post("/card/removeUserFromCard", {
                board_id: boardId,
                list_id: listId,
                card_id: cardId,
                remove_user_id: removeUserId,
                checkMessage: "Remove user from card",
            });

            const data = response.data;
            console.log("Removed user from card:", data);

            if (data.success) {
                return true;
            } else {
                console.error("Failed to remove user from card:", data.message);
                return false;
            }
        } catch (error) {
            console.error("Error removing user from card:", error);
            return false;
        }
    };

    // move card
    const moveCard = async (boardId, oldListId, newListId, cardId) => {
        try {
            const response = await privateAxios.post("/card/moveCard", {
                board_id: boardId,
                old_list_id: oldListId,
                new_list_id: newListId,
                card_id: cardId,
                checkMessage: "Move card",
            });

            const data = response.data;
            console.log("Moved card:", data);

            if (data.success) {
                return true;
            } else {
                console.error("Failed to move card:", data.message);
                return false;
            }
        } catch (error) {
            console.error("Error moving card:", error);
            return false;
        }
    };


    // move card with drag and drop (with position)
    const moveCardByDragAndDrop = async (boardId, oldListId, newListId, cardId, newCardIndex) => {
        try {
            const response = await privateAxios.post("/card/moveCardWithDragAndDrop", {
                board_id: boardId,
                old_list_id: oldListId,
                new_list_id: newListId,
                card_id: cardId,
                new_card_index: newCardIndex,
                checkMessage: "Move card with position",
            });

            const data = response.data;
            console.log("Moved card with position:", data);

            if (data.success) {
                return true;
            } else {
                console.error("Failed to move card with position:", data.message);
                return false;
            }
        } catch (error) {
            console.error("Error moving card with position:", error);
            return false;
        }
    };

    useEffect(() => {
        if (!connected) return;

        /* ---------- card được tạo (creator tab khác hoặc collaborator) */
        const onCreated = ({ card, list_id, board_id }) => {

        };

        /* ---------- card được cập-nhật (tiêu đề, privacy …) ----------- */
        const onUpdated = ({ card, list_id, board_id }) => {

        };

        /* ---------- card bị xoá --------------------------------------- */
        const onDeleted = ({ card_id, list_id, board_id }) => {

        };

        /* ----------Move card --------------------------------------*/
        const onMoveCard = ({ card_id, old_list_id, new_list_id, board_id }) => {

        }

        /* ----------Move card with position-------------------------*/
        const onMoveCardWithPosition = ({ card_id, old_list_id, new_list_id, new_card_index }) => {

        }

        /* ----------Thêm user vào card---------------*/
        const onAddNewMemberToCard = ({ card_id, list_id, board_id, assign_user_id }) => {

        };

        /* ----------tháo user khỏi card---------------*/
        const onRemoveMemberFromCard = ({ card_id, list_id, board_id, remove_user_id }) => {

        };

        /* ----------thêm attachment vào card---------------*/
        const onAddAttachment = ({ card_id, list_id, board_id, attachment }) => {

        }

        /* ----------tháo attachment khỏi card---------------*/
        const onRemoveAttachment = ({ board_id }) => {

        };

        socket.on("card:allmember:created", onCreated);
        socket.on("card:allmember:updated", onUpdated);
        socket.on("card:allmember:deleted", onDeleted);
        socket.on("card:allmember:move", onMoveCard);
        socket.on("card:allmember:move:position", onMoveCardWithPosition);
        socket.on("card:allmember:assign", onAddNewMemberToCard);
        socket.on("card:allmember:remove", onRemoveMemberFromCard);
        socket.on("card:allmember:add:attachment", onAddAttachment);
        socket.on("card:allmember:removed:attachment", onRemoveAttachment);

        return () => {
            socket.off("card:allmember:created", onCreated);
            socket.off("card:allmember:updated", onUpdated);
            socket.off("card:allmember:deleted", onDeleted);
            socket.off("card:allmember:move", onMoveCard);
            socket.off("card:allmember:move:position", onMoveCardWithPosition);
            socket.off("card:allmember:assign", onAddNewMemberToCard);
            socket.off("card:allmember:remove", onRemoveMemberFromCard);
            socket.off("card:allmember:add:attachment", onAddAttachment);
            socket.off("card:allmember:removed:attachment", onRemoveAttachment);
        };
    }, [connected, socket, cards]);

    return (
        <CardContext.Provider
            value={{ createCard, getCard, updateCard, assignUserToCard, removeUserFromCard, moveCard, moveCardByDragAndDrop }}
        >
            {children}
        </CardContext.Provider>
    );
};
