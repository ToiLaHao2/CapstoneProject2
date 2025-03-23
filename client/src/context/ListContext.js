import React, { createContext, useContext, useState } from "react";
import privateAxios from "../api/privateAxios";

const ListContext = createContext();

export const useList = () => useContext(ListContext);

export const ListProvider = ({ children }) => {
    const [lists, setLists] = useState([]);

    // Lấy danh sách lists trong board
    const fetchLists = async (boardId) => {
        try {
            console.log("Fetching lists for board ID:", boardId);

            const response = await privateAxios.post(
                "/list/getListsByBoardId",
                {
                    checkMessage: "Get lists in board",
                    board_id: boardId,
                }
            );

            const data = response.data;
            console.log("Response data:", data);

            if (data.success) {
                setLists(data.data);
                return data.data;
            } else {
                console.error("Failed to fetch lists:", data.message);
                return [];
            }
        } catch (error) {
            console.error("Error fetching lists:", error);
            return [];
        }
    };

    // Lấy 1 list cụ thể theo listId
    const getList = async (listId) => {
        try {
            console.log("Fetching list ID:", listId);

            const response = await privateAxios.post("/list/getList", {
                checkMessage: "Get list by ID",
                list_id: listId,
            });

            const data = response.data;
            console.log("Fetched list data:", data);

            if (data.success) {
                return data.data;
            } else {
                console.error("Failed to fetch list:", data.message);
                return null;
            }
        } catch (error) {
            console.error("Error fetching list:", error);
            return null;
        }
    };

    const createList = async (boardId, listTitle, listOrder) => {
        try {
            const response = await privateAxios.post("/list/createList", {
                checkMessage: "Create new list",
                board_id: boardId,
                list_title: listTitle,
                list_numerical_order: listOrder,
            });

            const data = response.data;
            console.log("Created list:", data);

            if (data.success && data.data) {
                return {
                    _id: data.data._id,
                    list_title: listTitle,
                    list_numerical_order: listOrder,
                    list_cards: [],
                    create_at: Date.now(),
                };
            } else {
                console.error("Failed to create list:", data.message);
                return null;
            }
        } catch (error) {
            console.error("Error creating list:", error);
            return null;
        }
    };

    // update list title
    const updateList = async (boardId, listId, listTitle) => {
        try {
            const response = await privateAxios.post("/list/updateList", {
                checkMessage: "Update list",
                board_id: boardId,
                list_id: listId,
                list_title: listTitle,
            });

            const data = response.data;
            console.log("Updated list:", data);

            if (data.success) {
                setLists((prevLists) =>
                    prevLists.map((list) =>
                        list._id === listId
                            ? { ...list, list_title: listTitle }
                            : list
                    )
                );
                return data.data;
            } else {
                console.error("Failed to update list:", data.message);
                return null;
            }
        } catch (error) {
            console.error("Error updating list:", error);
            return null;
        }
    };

    // delete list
    const deleteList = async (boardId, listId) => {
        try {
            console.log(
                "Lists state before delete:",
                JSON.stringify(lists, null, 2)
            );
            const response = await privateAxios.post("/list/deleteList", {
                checkMessage: "Delete list",
                board_id: boardId,
                list_id: listId,
            });

            const data = response.data;
            console.log("Deleted list:", data);

            if (data.success) {
                setLists((prevLists) =>
                    prevLists.filter((list) => list._id !== listId)
                );
                return true;
            } else {
                console.error("Failed to delete list:", data.message);
                return false;
            }
        } catch (error) {
            console.error("Error deleting list:", error);
            return false;
        }
    };

    const getCardsInList = async (boardId, listId) => {
        try {
            const response = await privateAxios.post("/list/getCardsInList", {
                board_id: boardId,
                list_id: listId,
                checkMessage: "Get cards in list",
            });

            const data = response.data;
            console.log("Fetched cards in list:", data);

            if (data.success) {
                return data.data;
            } else {
                console.error("Failed to fetch cards in list:", data.message);
                return [];
            }
        } catch (error) {
            console.error("Error fetching cards in list:", error);
            return [];
        }
    };

    return (
        <ListContext.Provider
            value={{
                lists,
                fetchLists,
                getList,
                createList,
                updateList,
                deleteList,
                getCardsInList,
            }}
        >
            {children}
        </ListContext.Provider>
    );
};
