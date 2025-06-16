import React, { createContext, useState, useContext, useEffect } from "react";
import privateAxios from "../api/privateAxios";
import { useSocket } from "./SocketContext";

const BoardContext = createContext();

export const BoardProvider = ({ children }) => {
    const [boards, setBoards] = useState([]);
    const { socket, connected } = useSocket();


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
    const getAllMembers = async (boardId) => {
        try {
            const response = await privateAxios.post("/board/getAllMembers", {
                checkMessage: "Get all members",
                board_id: boardId,
            });
            const data = await response.data;
            return data.data;
        } catch (error) {
            console.log("Error getting members", error);
            return [];
        }
    };

    //add member to board
    const addMemberToBoard = async (boardId, memberId, memberRole) => {
        try {
            const response = await privateAxios.post(
                "/board/addMemberToBoard",
                {
                    checkMessage: "Add member to board",
                    board_id: boardId,
                    member_id: memberId,
                    member_role: memberRole,
                }
            );

            const data = await response.data;

            if (data.success) {
                getAllBoardsByUserId();
                return "Success";
            } else {
                console.log("Add member failed:", data.message);
                return "Failed";
            }
        } catch (error) {
            console.log("Error adding member:", error);
            return "Error";
        }
    };

    // Move list trong board
    const moveList = async (boardId, listId1, listId2) => {
        try {
            const response = await privateAxios.post("/board/moveList", {
                checkMessage: "Move list",
                board_id: boardId,
                list_id1: listId1,
                list_id2: listId2,
            });

            const data = await response.data;
            if (data.success) {
                // Cập nhật state boards để phản ánh sự thay đổi thứ tự list
                setBoards((prevBoards) =>
                    prevBoards.map((board) => {
                        if (board._id === boardId) {
                            const updatedBoardLists = [...board.board_lists];
                            const index1 = updatedBoardLists.findIndex(
                                (item) => String(item.list_id) === String(listId1)
                            );
                            const index2 = updatedBoardLists.findIndex(
                                (item) => String(item.list_id) === String(listId2)
                            );

                            if (index1 !== -1 && index2 !== -1) {
                                // Hoán đổi vị trí list_id trong mảng board_lists
                                const temp = { ...updatedBoardLists[index1] };
                                updatedBoardLists[index1].list_id = listId2;
                                updatedBoardLists[index2].list_id = temp.list_id;
                                return { ...board, board_lists: updatedBoardLists };
                            }
                        }
                        return board;
                    })
                );
                return "Success";
            } else {
                console.log("Move list failed:", data.message);
                return "Failed";
            }
        } catch (error) {
            console.error("Error moving list:", error);
            return "Error";
        }
    };

    // Remove member from board
    const removeMemberFromBoard = async (boardId, memberId) => {
        try {
            const response = await privateAxios.post(
                "/board/removeMemberFromBoard",
                {
                    checkMessage: "Remove member from board",
                    board_id: boardId,
                    member_id: memberId,
                }
            );

            const data = await response.data;

            if (data.success) {
                // Cập nhật state boards để phản ánh việc xóa thành viên
                setBoards((prevBoards) =>
                    prevBoards.map((board) => {
                        if (board._id === boardId) {
                            return {
                                ...board,
                                board_collaborators: board.board_collaborators.filter(
                                    (collab) => String(collab.board_collaborator_id) !== String(memberId)
                                ),
                            };
                        }
                        return board;
                    })
                );
                return "Success";
            } else {
                console.log("Remove member failed:", data.message);
                return "Failed";
            }
        } catch (error) {
            console.log("Error removing member:", error);
            return "Error";
        }
    };

    //end-mei

    useEffect(() => {
        if (!connected) return;

        /* ---------- Board được tạo (creator tab khác hoặc collaborator) */
        const onCreated = ({ board }) => {
            setBoards((prev) =>
                prev.some((b) => String(b._id) === String(board._id))
                    ? prev
                    : [...prev, board]
            );
        };

        /* ---------- Board được cập-nhật (tiêu đề, privacy …) ----------- */
        const onUpdated = ({ patch, reference }) => {
            setBoards((prev) =>
                prev.map((b) =>
                    String(b._id) === String(reference.id) ? { ...b, ...patch } : b
                )
            );
        };

        /* ---------- Board bị xoá --------------------------------------- */
        // const onDeleted = ({ reference }) => {
        //     setBoards((prev) =>
        //         prev.filter((b) => String(b._id) !== String(reference.id))
        //     );
        //     // Nếu đang đứng trong board vừa bị xoá → về dashboard
        //     if (window.location.pathname.includes(reference.id))
        //         navigate("/dashboard");
        // };

        /* ---------- Notification (khi collaborator được add) ----------- */
        const onNotification = async (noti) => {
            const ref = noti.notification_reference;
            if (ref?.type !== "BOARD") return;

            const already = boards.some(
                (b) => String(b._id) === String(ref.id)
            );
            if (already) return;

            // REST lấy board đầy đủ
            try {
                const { data } = await privateAxios.post("/board/getBoardById", {
                    board_id: ref.id,
                    checkMessage: "Get board by id",
                });
                if (data.success) {
                    setBoards((prev) => [...prev, data.data]);
                }
            } catch (err) {
                console.error("Fetch board error", err);
            }
        };

        socket.on("board:created", onCreated);
        socket.on("board:updated", onUpdated);
        // socket.on("board:deleted", onDeleted);
        socket.on("newNotification", onNotification);

        return () => {
            socket.off("board:created", onCreated);
            socket.off("board:updated", onUpdated);
            // socket.off("board:deleted", onDeleted);
            socket.off("newNotification", onNotification);
        };
    }, [connected, socket, boards]);

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
                getAllMembers,
                addMemberToBoard,
                moveList,
                removeMemberFromBoard
            }}
        >
            {children}
        </BoardContext.Provider>
    );
};

export const useBoard = () => {
    return useContext(BoardContext);
};
