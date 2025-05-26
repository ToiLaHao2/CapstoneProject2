import React, { createContext, useContext, useState } from "react";
import privateAxios from "../api/privateAxios";

const CardContext = createContext();

export const useCard = () => useContext(CardContext);

export const CardProvider = ({ children }) => {
    const [cards, setCards] = useState([]);

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

    return (
        <CardContext.Provider
            value={{ createCard, getCard, updateCard, assignUserToCard, moveCard }}
        >
            {children}
        </CardContext.Provider>
    );
};
