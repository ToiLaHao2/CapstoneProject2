import React, { useState, useEffect } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
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
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { useCard } from "../../context/CardContext";

const TaskCard = ({ task, boardId }) => {
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id: task.id });
    const navigate = useNavigate();

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        cursor: "pointer",
    };

    return (
        <div
            className="task-card"
            ref={setNodeRef}
            {...attributes}
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

            <span className="task-tag" {...listeners}>
                {task.tag}
            </span>
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
    return (
        <div className="column">
            <div className="column-container-title">
                <h2 className="column-title">{column.title}</h2>

                <div className="column-actions">
                    <FiEdit
                        className="column-action-icon"
                        onClick={() => onEditColumnTitle(column.id)}
                    />
                    <FiTrash2
                        className="column-action-icon"
                        onClick={onDeleteColumn}
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
    const [columns, setColumns] = useState([]);
    const [columnOrder, setColumnOrder] = useState([]);
    const { createCard } = useCard();

    const fetchLists = async () => {
        try {
            const lists = await getListsInBoard(boardId);

            if (!Array.isArray(lists)) return;
            const columnsWithTasks = await Promise.all(
                lists.map(async (list) => {
                    const cards = await getCardsInList(boardId, list._id);
                    console.log(`Cards in list ${list._id}:`, cards);
                    // console.log(`Cards in list ${list._id}:`, JSON.stringify(cards, null, 2));

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
                columns.length + 1
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
                console.log("New card created:", newCard);

                setColumns((prevColumns) =>
                    prevColumns.map((column) => {
                        if (column.id === columnId) {
                            console.log("Before update:", column.tasks);
                            console.log("Adding task:", newCard);
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

    const onDragEnd = (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        setColumns((prev) => {
            const sourceCol = prev.find((col) =>
                col.tasks.some((task) => task.id === active.id)
            );
            const targetCol = prev.find((col) =>
                col.tasks.some((task) => task.id === over.id)
            );

            if (sourceCol && targetCol && sourceCol.id === targetCol.id) {
                const colIndex = prev.findIndex(
                    (col) => col.id === sourceCol.id
                );
                const newTasks = arrayMove(
                    sourceCol.tasks,
                    sourceCol.tasks.findIndex((task) => task.id === active.id),
                    targetCol.tasks.findIndex((task) => task.id === over.id)
                );
                return prev.map((col, i) =>
                    i === colIndex ? { ...col, tasks: newTasks } : col
                );
            }

            if (sourceCol && targetCol) {
                const taskToMove = sourceCol.tasks.find(
                    (task) => task.id === active.id
                );
                return prev.map((col) =>
                    col.id === sourceCol.id
                        ? {
                              ...col,
                              tasks: col.tasks.filter(
                                  (task) => task.id !== active.id
                              ),
                          }
                        : col.id === targetCol.id
                        ? { ...col, tasks: [...col.tasks, taskToMove] }
                        : col
                );
            }

            return prev;
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
            </DndContext>
        </div>
    );
};

export default Tasks;
