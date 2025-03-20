import React, { createContext, useContext } from "react";
import privateAxios from "../api/privateAxios";

const CardContext = createContext();

export const useCard = () => useContext(CardContext);

export const CardProvider = ({ children }) => {
    // create card
    const createCard = async (boardId, listId, cardTitle) => {
        try {
            const response = await privateAxios.post("/card/createCard", {
                board_id: boardId,
                list_id: listId,
                card_title: cardTitle,
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

    return (
        <CardContext.Provider value={{ createCard, getCard }}>
            {children}
        </CardContext.Provider>
    );
};