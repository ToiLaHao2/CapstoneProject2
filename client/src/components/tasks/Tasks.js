import React, { useState, useEffect } from "react";
import { DndContext, closestCenter, DragOverlay, useDroppable } from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
    arrayMove,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useLocation, useNavigate } from "react-router-dom";
import { useBoard } from "../../context/BoardContext";
import { useList } from "../../context/ListContext";
import "../general/MainContentContainer.css";
import "./Tasks.css";
import { FiEdit, FiTrash2, FiMove } from "react-icons/fi";
import { useCard } from "../../context/CardContext";
import { useSocket } from "../../context/SocketContext";


const TaskCard = ({ task, boardId }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id });

    const navigate = useNavigate();

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        cursor: "pointer",
        opacity: isDragging ? 0.5 : 1,
        transform: CSS.Transform.toString(transform),
        transition,
        // boxShadow: isDragging ? '0 4px 8px rgba(0,0,0,0.2)' : 'none',
        boxShadow: 'none',
        zIndex: isDragging ? 9999 : 0,
        position: 'relative',
    };

    const formattedCardDuration = task.card_duration
        ? new Date(task.card_duration).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        })
        : '';

    return (
        <div
            className="task-card"
            ref={setNodeRef}
            style={style}
        >

            <h3

                className="task-title"
                onClick={() => {
                    console.log("Task Data:", task);
                    navigate(`/card-detail/${task.id}`, {
                        state: {
                            task: task,
                            listId: task.list_id,
                            boardId: boardId,
                        },
                    });
                }}
            >
                {task.card_title}
            </h3>

            <div className="task-footer">
                <span className="task-tag">
                    {/* {task.tag} */}
                    {task.card_priority}<i> {formattedCardDuration}</i>

                </span>

                <div className="task-drag-handle" {...attributes} {...listeners}>
                    <FiMove className="drag-icon" />
                </div>
            </div>


        </div>
    );
};

const Column = ({
    column,
    tasks = [],
    onAddCard,
    onEditColumnTitle,
    onDeleteColumn,
    boardId,
}) => {
    // Sử dụng useDroppable để biến Column thành một droppable area
    const { setNodeRef, isOver } = useDroppable({
        id: column.id, // ID của droppable là ID của cột
    });

    return (
        <div
            className={`column ${isOver && tasks.length === 0 ? 'droppable-empty-list' : ''}`}
            ref={setNodeRef}
        >
            <div className="column-container-title">
                <h2 className="column-title">{column.title}</h2>

                <div className="column-actions">
                    <FiEdit
                        className="column-action-icon"
                        onClick={() => onEditColumnTitle(column.id)}
                    />
                    <FiTrash2
                        className="column-action-icon"
                        onClick={() => onDeleteColumn(column.id)}
                    // onClick={onDeleteColumn}
                    />
                </div>
            </div>

            <SortableContext
                items={tasks.map((task) => task.id)}
                strategy={verticalListSortingStrategy}
            >

                <div className="task-list">
                    {tasks.map((task) => (
                        <TaskCard key={task.id} task={task} boardId={boardId} />
                    ))}
                    {/* Placeholder khi list rỗng để người dùng biết có thể thả vào */}
                    {tasks.length === 0 && isOver && (
                        <div className="drop-placeholder">Drop your card here</div>
                    )}
                </div>
            </SortableContext>

            <button className="add-card" onClick={() => onAddCard(column.id)}>
                + Add a card
            </button>
        </div>
    );
};

const Tasks = () => {
    const location = useLocation();
    const { getListsInBoard } = useBoard();
    const { createList, updateList, deleteList, getCardsInList } = useList();
    const boardTitle = location.state?.boardTitle || "Untitled Board";
    const boardId = location.state?.board_id;
    const [columns, setColumns] = useState([{}]);
    const [columnOrder, setColumnOrder] = useState([]);
    const { createCard } = useCard();
    const { moveCardByDragAndDrop } = useCard();
    const { socket, connected } = useSocket();

    const [activeId, setActiveId] = useState(null);
    const activeTask = activeId
        ? columns
            .flatMap((column) => column.tasks)
            .find((task) => task.id === activeId)
        : null;

    const fetchLists = async () => {
        try {
            const lists = await getListsInBoard(boardId);

            if (!Array.isArray(lists)) return;
            const columnsWithTasks = await Promise.all(
                lists.map(async (list) => {
                    const cards = await getCardsInList(boardId, list._id);
                    console.log(`Cards in list ${list._id}:`, cards);

                    return {
                        id: list._id,
                        title: list.list_title || "Unnamed Column",
                        tasks: Array.isArray(cards)
                            ? cards.map((card) => ({
                                ...card,
                                id: card._id,
                                list_id: list._id,
                                board_id: boardId,
                            }))
                            : [],
                    };
                })
            );
            setColumns(columnsWithTasks);
            setColumnOrder(lists.map((list) => list._id));
        } catch (error) {
            console.error("Error fetching lists:", error);
        }
    };

    // socket here
    useEffect(() => {
        if (!connected) return;
        /* ---------- card được tạo (creator tab khác hoặc collaborator) */
        const onCreated = ({ card, list_id, board_id }) => {
            setColumns((prevColumns) =>
                prevColumns.map((column) => {
                    if (column.id === list_id) {
                        return {
                            ...column,
                            tasks: [
                                ...column.tasks,
                                { ...card, id: card._id },
                            ],
                        };
                    }
                    return column;
                })
            );
        };

        /* ----------Move card --------------------------------------*/
        const onMoveCard = ({ card_id, old_list_id, new_list_id }) => {
            setColumns((prevCols) => {
                /* 1️⃣ Tìm ra card cần di chuyển */
                let movedCard = null;

                const colsWithoutCard = prevCols.map((col) => {
                    if (String(col.id) !== String(old_list_id)) return col;

                    // Lấy card & loại khỏi mảng
                    const filtered = col.tasks.filter((c) => {
                        if (String(c.id) === String(card_id)) {
                            movedCard = c;          // giữ lại để add sang list mới
                            return false;           // loại khỏi list cũ
                        }
                        return true;
                    });

                    return { ...col, tasks: filtered };
                });

                if (!movedCard) return prevCols;        // không tìm thấy → bỏ qua

                /* 2️⃣ Thêm card vào list đích */
                const updated = colsWithoutCard.map((col) =>
                    String(col.id) === String(new_list_id)
                        ? { ...col, tasks: [...col.tasks, movedCard] } // thêm cuối list
                        : col
                );

                return updated;
            });
        };

        const onMoveCardWithPosition = ({
            card_id,
            old_list_id,
            new_list_id,
            new_card_index,
        }) => {
            setColumns((prevCols) => {
                let updatedColumns = prevCols.map((col) => ({
                    ...col,
                    tasks: [...col.tasks], // Clone tasks mảng để tránh mutate state
                }));

                let cardToMove = null;

                // 1. Di chuyển trong CÙNG một list
                if (old_list_id === new_list_id) {
                    updatedColumns = updatedColumns.map((col) => {
                        if (col.id.toString() !== old_list_id.toString()) return col; // Tìm đúng list

                        // Tìm thẻ cần di chuyển
                        const cardIdx = col.tasks.findIndex((task) => task.id === card_id);
                        if (cardIdx === -1) return col; // Nếu không tìm thấy card

                        cardToMove = col.tasks[cardIdx];
                        const updatedTasks = col.tasks.filter((task) => task.id !== card_id);
                        updatedTasks.splice(new_card_index, 0, cardToMove); // Chèn vào vị trí mới

                        return { ...col, tasks: updatedTasks };
                    });
                }

                // 2. Di chuyển sang list khác
                else {
                    let sourceColumnId = old_list_id;
                    let destinationColumnId = new_list_id;

                    // 2A. Loại bỏ thẻ khỏi list cũ
                    updatedColumns = updatedColumns.map((col) => {
                        if (col.id !== sourceColumnId) return col; // Tìm đúng list cũ

                        // Tìm thẻ cần di chuyển và loại bỏ khỏi list
                        cardToMove = col.tasks.find((task) => task.id === card_id);
                        const updatedTasks = col.tasks.filter((task) => task.id !== card_id);

                        return { ...col, tasks: updatedTasks };
                    });

                    if (!cardToMove) return prevCols; // Nếu không tìm thấy card, không làm gì

                    // 2B. Thêm thẻ vào list mới tại vị trí new_card_index
                    updatedColumns = updatedColumns.map((col) => {
                        if (col.id !== destinationColumnId) return col;

                        const updatedTasks = [...col.tasks];
                        updatedTasks.splice(new_card_index, 0, cardToMove); // Thêm thẻ vào vị trí mới

                        return { ...col, tasks: updatedTasks };
                    });
                }

                return updatedColumns;
            });
        };

        /* ----------List được tạo (creator tab khác hoặc collaborator) */
        const onCreatedList = ({ list, board_id }) => {
            setColumns((prev) => {
                if (prev.some((c) => String(c.id) === String(list._id))) return prev;
                return [...prev, {
                    id: list._id,
                    title: list.list_title,
                    tasks: []
                }];
            })
        };

        /* ---------- list được cập-nhật  ----------- */
        const onUpdatedList = ({ list, board_id }) => {
            setColumns((prev) => {
                return prev.map((col) => {
                    if (String(col.id) === String(list._id)) {
                        // Nếu đã tồn tại cột với id tương ứng, cập nhật title
                        return { ...col, title: list.list_title };
                    }
                    return col;  // Nếu không, giữ nguyên column đó
                });
            });
        };

        /* ---------- list bị xoá --------------------------------------- */
        const onDeletedList = ({ list_id, board_id }) => {
            setColumns((prevCols) =>
                prevCols.filter((col) => col.id !== list_id)
            );
        };


        socket.on("list:allmember:created", onCreatedList);
        socket.on("list:allmember:updated", onUpdatedList);
        socket.on("list:allmember:deleted", onDeletedList);
        socket.on("card:allmember:created", onCreated);
        socket.on("card:allmember:move", onMoveCard);
        socket.on("card:allmember:move:position", onMoveCardWithPosition);
        return () => {
            socket.off("list:allmember:created", onCreatedList);
            socket.off("list:allmember:deleted", onUpdatedList);
            socket.off("list:allmember:deleted", onDeletedList);
            socket.off("card:allmember:created", onCreated);
            socket.off("card:allmember:move", onMoveCard);
            socket.off("card:allmember:move:position", onMoveCardWithPosition);
        }
    }, [connected, socket, columns])

    useEffect(() => {
        if (!boardId) return;
        fetchLists();
    }, [boardId]);

    const addColumn = async () => {
        const columnTitle = prompt("Enter list title:");
        if (!columnTitle || !boardId) return;

        try {
            const newList = await createList(
                boardId,
                columnTitle,
            );
            if (newList) {
                await fetchLists();
            }
        } catch (error) {
            console.error("Error adding list:", error);
        }
    };

    const addCard = async (columnId) => {
        const cardTitle = prompt("Enter card title:");
        if (!cardTitle) return;

        try {
            const newCard = await createCard(boardId, columnId, cardTitle);
            if (newCard) {

                setColumns((prevColumns) =>
                    prevColumns.map((column) => {
                        if (column.id === columnId) {
                            return {
                                ...column,
                                tasks: [
                                    ...column.tasks,
                                    { ...newCard, id: newCard._id },
                                ],
                            };
                        }
                        return column;
                    })
                );
            }
        } catch (error) {
            console.error("Error creating card:", error);
        }
    };

    // Hàm xử lý khi bắt đầu kéo
    const onDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const onDragEnd = async (event) => {
        const { active, over } = event;

        setActiveId(null);

        if (!over) {
            return;
        }

        // Nếu kéo vào chính nó hoặc thả ra ngoài vùng hợp lệ, không làm gì
        if (active.id === over.id) {
            return;
        }

        let sourceColumnId = null;
        let activeTask = null;

        // Tìm column chứa card đang kéo
        columns.forEach((column) => {
            const taskIndex = column.tasks.findIndex((task) => task.id === active.id);
            if (taskIndex !== -1) {
                sourceColumnId = column.id;
                activeTask = column.tasks[taskIndex];
            }
        });

        if (!activeTask || !sourceColumnId) {
            return;
        }

        setColumns((prevColumns) => {
            let newColumns = prevColumns.map((column) => ({ ...column, tasks: [...column.tasks] }));
            let destinationColumnId = null;
            let destinationTaskIndex = -1;

            // Xóa card khỏi column nguồn trong trạng thái UI tạm thời
            newColumns = newColumns.map(column => {
                if (column.id === sourceColumnId) {
                    return { ...column, tasks: column.tasks.filter(task => task.id !== active.id) };
                }
                return column;
            });

            // Xác định cột đích
            // over.id có thể là ID của một TaskCard hoặc ID của một Column (khi kéo vào khoảng trống của cột đó)
            let foundOverColumn = false;
            for (const column of newColumns) {
                // Trường hợp 1: Thả vào một card khác trong cột
                const taskIndex = column.tasks.findIndex(task => task.id === over.id);
                if (taskIndex !== -1) {
                    destinationColumnId = column.id;
                    destinationTaskIndex = taskIndex;
                    foundOverColumn = true;
                    break;
                }
                // Trường hợp 2: Thả trực tiếp vào một cột (có thể là cột rỗng)
                // Kiểm tra nếu over.id là ID của một cột
                if (column.id === over.id) {
                    destinationColumnId = column.id;
                    destinationTaskIndex = column.tasks.length; // Đặt cuối cột
                    foundOverColumn = true;
                    break;
                }
            }

            if (!foundOverColumn) {
                // Nếu không tìm thấy cột đích hợp lệ, có thể card được thả ra ngoài
                // Hoặc có lỗi trong logic tìm kiếm. Tốt nhất là không cập nhật gì.
                console.warn("Could not find a valid drop target column.");
                return prevColumns; // Trả về trạng thái cũ
            }

            // Cập nhật card vào cột đích trong UI
            newColumns = newColumns.map((column) =>
                column.id === destinationColumnId
                    ? {
                        ...column,
                        tasks: [
                            ...column.tasks.slice(0, destinationTaskIndex),
                            activeTask, // Thêm activeTask vào vị trí mới
                            ...column.tasks.slice(destinationTaskIndex),
                        ],
                    }
                    : column
            );

            // Gọi API để cập nhật backend
            if (activeTask) {
                moveCardByDragAndDrop(
                    boardId,
                    sourceColumnId,
                    destinationColumnId,
                    activeTask.id,
                    destinationTaskIndex
                );
            }

            return newColumns;
        });
    };


    const handleEditColumnTitle = async (columnId) => {
        const newTitle = prompt("Enter new column title:");
        if (!newTitle) {
            console.error("New title is missing.");
            return;
        }

        try {
            await updateList(boardId, columnId, newTitle);
            await fetchLists();
            alert("Column title updated successfully!");
        } catch (error) {
            console.error("Error updating column:", error);
            alert("Failed to update column title.");
        }
    };

    const handleDeleteColumn = async (columnId) => {
        if (window.confirm("Are you sure you want to delete this column?")) {
            try {
                await deleteList(boardId, columnId);
                await fetchLists();
                alert("Column deleted successfully!");
            } catch (error) {
                console.error("Error deleting column:", error);
                alert("Failed to delete column.");
            }
        }
    };

    return (
        <div>
            <div>
                <div>
                    <h1 className="project-title">{boardTitle}</h1>
                </div>
            </div>
            <DndContext
                collisionDetection={closestCenter}
                onDragEnd={onDragEnd}
            >
                <SortableContext
                    items={columns.map((col) => col.title)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="kanban-board">
                        {columns.map((column) => (
                            <Column
                                key={column.id}
                                column={column}
                                tasks={column.tasks}
                                onAddCard={addCard}
                                onEditColumnTitle={handleEditColumnTitle}
                                onDeleteColumn={handleDeleteColumn}
                                boardId={boardId}
                            />
                        ))}
                        <button className="add-column" onClick={addColumn}>
                            + Add another list
                        </button>
                    </div>
                </SortableContext>


                <DragOverlay>
                    {activeTask ? (
                        <TaskCard
                            task={activeTask}
                            boardId={boardId}
                        />
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
};

export default Tasks;
