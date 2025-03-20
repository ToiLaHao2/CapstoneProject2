import React, { createContext, useState, useContext } from "react";
import privateAxios from "../api/privateAxios";

const BoardContext = createContext();

export const BoardProvider = ({ children }) => {
    const [boards, setBoards] = useState([]);
    const colorHashMap = {
        A: "#8B0000", // Dark Red
        B: "#00008B", // Dark Blue
        C: "#006400", // Dark Green
        D: "#B8860B", // Dark Goldenrod
        E: "#FF8C00", // Dark Orange
        F: "#4B0082", // Indigo
        G: "#8B4513", // Saddle Brown
        H: "#2F4F4F", // Dark Slate Gray
        I: "#008B8B", // Dark Cyan
        J: "#8B0000", // Dark Red
        K: "#556B2F", // Dark Olive Green
        L: "#483D8B", // Dark Slate Blue
        M: "#8B008B", // Dark Magenta
        N: "#800000", // Maroon
        O: "#9932CC", // Dark Orchid
        P: "#191970", // Midnight Blue
        Q: "#8B0000", // Dark Red
        R: "#228B22", // Forest Green
        S: "#A52A2A", // Brown
        T: "#2E8B57", // Sea Green
        U: "#696969", // Dim Gray
        V: "#3CB371", // Medium Sea Green
        W: "#8B0000", // Dark Red
        X: "#4B0082", // Indigo
        Y: "#9400D3", // Dark Violet
        Z: "#5F9EA0", // Cadet Blue
    };

    // Gọi API để lấy danh sách bảng ngay sau khi đăng nhập
    const getAllBoardsByUserId = async () => {
        try {
            const response = await privateAxios.post(
                "/board/getBoardsByUserId",
                {
                    checkMessage: "Get boards by user id",
                }
            );
            const boards = await response.data.data;
            for (const board of boards) {
                const response = await privateAxios.post(
                    "/board/getAllMembers",
                    {
                        checkMessage: "Get all members",
                        board_id: board._id,
                    }
                );
                const data = await response.data;
                board.board_collaborators = data.data;
            }
            setBoards(boards);
            return;
        } catch (error) {
            console.log(error);
            return;
        }
    };

    // Gọi API tạo bảng mới đợi xác nhận success thì thêm id bảng
    // mới trả về vào object rồi add vào boards rồi show ra
    const createBoard = async ({ boardTitle, boardDescription, boardType }) => {
        const newBoard = {
            _id: null,
            board_title: boardTitle,
            board_description: boardDescription,
            board_is_public: boardType,
            board_collaborators: [],
            board_list: [],
            create_at: "",
        };
        try {
            const response = await privateAxios.post("board/createBoard", {
                checkMessage: "Create new board",
                board_title: boardTitle,
                board_description: boardDescription,
                board_is_public: boardType,
                board_collaborators: [],
                board_list: [],
            });
            const data = await response.data;
            newBoard._id = data.data;
            newBoard.create_at = Date.now();
            setBoards([...boards, newBoard]);
            return "Success";
        } catch (error) {
            console.log(error);
        }
    };

    //mei
    //update board
    const updateBoard = async (boardId, newTitle) => {
        try {
            const response = await privateAxios.post("/board/updateBoard", {
                checkMessage: "Update board",
                board_id: boardId,
                board_update_details: { board_title: newTitle },
            });

            const data = await response.data;

            if (data.success) {
                setBoards((prevBoards) =>
                    prevBoards.map((board) =>
                        board._id === boardId
                            ? { ...board, board_title: newTitle }
                            : board
                    )
                );
                return "Success";
            } else {
                console.log("Update failed:", data.message);
                return "Failed";
            }
        } catch (error) {
            console.log("Error updating board:", error);
            return "Error";
        }
    };

    //delete board
    const deleteBoard = async (boardId) => {
        try {
            const response = await privateAxios.post("/board/deleteBoard", {
                checkMessage: "Delete board",
                board_id: boardId,
            });

            const data = await response.data;

            if (data.success) {
                setBoards((prevBoards) =>
                    prevBoards.filter((board) => board._id !== boardId)
                );
                return "Success";
            } else {
                console.log("Delete failed:", data.message);
                return "Failed";
            }
        } catch (error) {
            console.log("Error deleting board:", error);
            return "Error";
        }
    };

    const getListsInBoard = async (boardId) => {
        try {
            console.log("Fetching lists for board ID:", boardId);

            const response = await privateAxios.post("/board/getListsInBoard", {
                checkMessage: "Get lists in board",
                board_id: boardId,
            });

            const data = await response.data;
            console.log("Response data:", data);

            if (data.success) {
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

    // update privacy
    const updatePrivacy = async (boardId, newPrivacy) => {
        try {
            const response = await privateAxios.post("/board/updatePrivacy", {
                checkMessage: "Update privacy",
                board_id: boardId,
                new_privacy: newPrivacy,
            });

            const data = await response.data;

            if (data.success) {
                setBoards((prevBoards) =>
                    prevBoards.map((board) =>
                        board._id === boardId
                            ? { ...board, board_is_public: newPrivacy }
                            : board
                    )
                );
                return "Success";
            } else {
                console.log("Update privacy failed:", data.message);
                return "Failed";
            }
        } catch (error) {
            console.log("Error updating privacy:", error);
            return "Error";
        }
    };

    //add list to board
    //get all users in board
    // const getAllUsers

    //end-mei

    return (
        <BoardContext.Provider
            value={{
                boards,
                getAllBoardsByUserId,
                createBoard,
                updateBoard,
                deleteBoard,
                getListsInBoard,
                updatePrivacy,
                colorHashMap,
            }}
        >
            {children}
        </BoardContext.Provider>
    );
};

export const useBoard = () => {
    return useContext(BoardContext);
};
