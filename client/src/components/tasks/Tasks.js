// import React, { useState, useEffect } from "react";
// import { DndContext, closestCenter } from "@dnd-kit/core";
// import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
// import { useSortable } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";
// import { useLocation, useNavigate } from "react-router-dom";
// import { useBoard } from "../../context/BoardContext";
// import { useList } from "../../context/ListContext";
// import "../general/MainContentContainer.css";
// import "./Tasks.css";

// const TaskCard = ({ task }) => {
//   const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id });
//   const navigate = useNavigate();

//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//     cursor: "pointer",
//   };

//   return (
//     <div className="task-card" ref={setNodeRef} {...attributes} style={style}>
//       <h3 className="task-title" onClick={() => navigate(`/card-detail/${task.id}`)}>{task.title}</h3>
//       <span className="task-tag" {...listeners}>{task.tag}</span>
//     </div>
//   );
// };

// const Column = ({ column, tasks = [], onAddCard }) => (
//   <div className="column">
//     <div className="column-container-title">
//       <h2 className="column-title">{column.title}</h2>
//     </div>
//     <SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
//       <div className="task-list">
//         {tasks.map(task => <TaskCard key={task.id} task={task} />)}
//       </div>
//     </SortableContext>
//     <button className="add-card" onClick={() => onAddCard(column.id)}>+ Add a card</button>
//   </div>
// );

// const Tasks = () => {
//   const location = useLocation();
//   const { getListsInBoard } = useBoard();
//   const { createList } = useList();
//   const boardTitle = location.state?.boardTitle || "Untitled Board";
//   const boardId = location.state?.board_id;

//   const [columns, setColumns] = useState([]);
//   const [columnOrder, setColumnOrder] = useState([]);

//   const fetchLists = async () => {
//     try {
//       const lists = await getListsInBoard(boardId);
//       if (!Array.isArray(lists)) return;

//       setColumns(lists.map(list => ({
//         id: list._id,
//         title: list.list_title || "Unnamed Column",
//         tasks: Array.isArray(list.tasks)
//           ? list.tasks.map(task => ({ ...task, id: task._id }))
//           : []
//       })));

//       setColumnOrder(lists.map(list => list._id));
//     } catch (error) {
//       console.error("Error fetching lists:", error);
//     }
//   };

//   useEffect(() => {
//     if (!boardId) return;
//     fetchLists();
//   }, [boardId]);

//   const addColumn = async () => {
//     const columnTitle = prompt("Enter column title:");
//     if (!columnTitle || !boardId) return;

//     try {
//       const newList = await createList(boardId, columnTitle, columns.length + 1);
//       if (newList) {
//         await fetchLists();
//       }
//     } catch (error) {
//       console.error("Error adding column:", error);
//     }
//   };

//   const addCard = columnId => {
//     const cardTitle = prompt("Enter task title:");
//     if (!cardTitle) return;

//     setColumns(prev => prev.map(col => col.id === columnId ? {
//       ...col,
//       tasks: [...col.tasks, { id: `task-${Date.now()}`, title: cardTitle, tag: "General" }]
//     } : col));
//   };

//   const onDragEnd = event => {
//     const { active, over } = event;
//     if (!over || active.id === over.id) return;

//     setColumns(prev => {
//       const sourceCol = prev.find(col => col.tasks.some(task => task.id === active.id));
//       const targetCol = prev.find(col => col.tasks.some(task => task.id === over.id));

//       if (sourceCol && targetCol && sourceCol.id === targetCol.id) {
//         const colIndex = prev.findIndex(col => col.id === sourceCol.id);
//         const newTasks = arrayMove(sourceCol.tasks,
//           sourceCol.tasks.findIndex(task => task.id === active.id),
//           targetCol.tasks.findIndex(task => task.id === over.id)
//         );
//         return prev.map((col, i) => i === colIndex ? { ...col, tasks: newTasks } : col);
//       }

//       if (sourceCol && targetCol) {
//         const taskToMove = sourceCol.tasks.find(task => task.id === active.id);
//         return prev.map(col => col.id === sourceCol.id
//           ? { ...col, tasks: col.tasks.filter(task => task.id !== active.id) }
//           : col.id === targetCol.id
//           ? { ...col, tasks: [...col.tasks, taskToMove] }
//           : col
//         );
//       }

//       return prev;
//     });
//   };

//   return (
//     <>
//       <h1 className="project-title">{boardTitle}</h1>
//       <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
//         <SortableContext items={columnOrder} strategy={verticalListSortingStrategy}>
//           <div className="kanban-board">
//             {columns.map(column => (
//               <Column key={column.id} column={column} tasks={column.tasks} onAddCard={addCard} />
//             ))}
//             <button className="add-column" onClick={addColumn}>+ Add another list</button>
//           </div>
//         </SortableContext>
//       </DndContext>
//     </>
//   );
// };

// export default Tasks;

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

const TaskCard = ({ task }) => {
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
                onClick={() => navigate(`/card-detail/${task.id}`)}
            >
                {task.title}
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
}) => {
    return (
        <div className="column">
            <div className="column-container-title">
                <h2 className="column-title">{column.title}</h2>

                <div className="column-actions">
                    {/* <FiEdit className="column-action-icon" onClick={onEditColumnTitle} /> */}
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
                        <TaskCard key={task.id} task={task} />
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
    const { createList, updateList, deleteList } = useList(); // Thêm updateList và deleteList context
    const boardTitle = location.state?.boardTitle || "Untitled Board";
    const boardId = location.state?.board_id;

    const [columns, setColumns] = useState([]);
    const [columnOrder, setColumnOrder] = useState([]);

    const fetchLists = async () => {
        try {
            const lists = await getListsInBoard(boardId);
            if (!Array.isArray(lists)) return;

            setColumns(
                lists.map((list) => ({
                    id: list._id,
                    title: list.list_title || "Unnamed Column",
                    tasks: Array.isArray(list.tasks)
                        ? list.tasks.map((task) => ({ ...task, id: task._id }))
                        : [],
                }))
            );

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
        const columnTitle = prompt("Enter column title:");
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
            console.error("Error adding column:", error);
        }
    };

    const addCard = (columnId) => {
        const cardTitle = prompt("Enter task title:");
        if (!cardTitle) return;

        setColumns((prev) =>
            prev.map((col) =>
                col.id === columnId
                    ? {
                          ...col,
                          tasks: [
                              ...col.tasks,
                              {
                                  id: `task-${Date.now()}`,
                                  title: cardTitle,
                                  tag: "General",
                              },
                          ],
                      }
                    : col
            )
        );
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

    // const handleDeleteColumn = async (columnId) => {
    //   try {
    //     await deleteList(columnId);
    //     await fetchLists();
    //   } catch (error) {
    //     console.error("Error deleting column:", error);
    //   }
    // };

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
                <div>hello</div>
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
