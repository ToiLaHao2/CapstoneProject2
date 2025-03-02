import React, { useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import "../general/MainContentContainer.css";
import "./Tasks.css";

import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

const TaskCard = ({ task }) => {
  const navigate = useNavigate();
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "pointer",
  };

  const handleClick = () => {
    navigate(`/task/${task.id}`, { state: { task } });
  };

  return (
    <div
      className="task-card"
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      onClick={handleClick}
    >
      <h3 className="task-title">{task.title}</h3>
      <span className="task-tag">{task.tag}</span>
    </div>
  );
};

const Column = ({ column, tasks = [], onAddCard }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div className="column" ref={setNodeRef} style={style}>
      {/* Chỉ áp dụng drag cho phần tiêu đề */}
      <div className="column-container-title" >
        <h2 className="column-title"  {...attributes} {...listeners}>
          {column.title}
        </h2>
      </div>
      <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
        <div className="task-list">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </SortableContext>
      {/* Nút add card sẽ không bị ảnh hưởng bởi drag */}
      <button className="add-card" onClick={onAddCard}>
        + Add a card
      </button>
    </div>
  );
};

const Tasks = () => {
  const location = useLocation();
  const boardTitle = location.state?.boardTitle || "Untitled Board";

  const [columns, setColumns] = useState([
    { id: "1", title: "To Do", tasks: [] },
    { id: "2", title: "In Progress", tasks: [] },
    { id: "3", title: "Done", tasks: [] },
  ]);

  const addColumn = () => {
    const columnTitle = prompt("Enter column title:");
    if (!columnTitle) return;

    const newColumn = { id: String(Date.now()), title: columnTitle, tasks: [] };
    setColumns([...columns, newColumn]);
  };

  const addCard = (columnId) => {
    const cardTitle = prompt("Enter task title:");
    if (!cardTitle) return;
    setColumns(
      columns.map((col) =>
        col.id === columnId
          ? {
            ...col,
            tasks: [...col.tasks, { id: String(Date.now()), title: cardTitle, tag: "General" }],
          }
          : col
      )
    );
  };

  const onDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // Tìm danh sách chứa task được kéo
    const activeColumn = columns.find((col) => col.tasks.some((task) => task.id === active.id));
    const overColumn = columns.find((col) => col.tasks.some((task) => task.id === over.id));

    if (activeColumn && overColumn && activeColumn.id === overColumn.id) {
      // Nếu kéo trong cùng một danh sách, sắp xếp lại thứ tự
      const columnIndex = columns.findIndex((col) => col.id === activeColumn.id);
      const oldIndex = activeColumn.tasks.findIndex((task) => task.id === active.id);
      const newIndex = overColumn.tasks.findIndex((task) => task.id === over.id);

      const newTasks = arrayMove(activeColumn.tasks, oldIndex, newIndex);

      setColumns(
        columns.map((col, index) =>
          index === columnIndex ? { ...col, tasks: newTasks } : col
        )
      );
    } else if (activeColumn && overColumn) {
      // Tìm task được kéo
      const taskToMove = activeColumn.tasks.find((task) => task.id === active.id);

      setColumns(
        columns.map((col) => {
          if (col.id === activeColumn.id) {
            return { ...col, tasks: col.tasks.filter((task) => task.id !== active.id) };
          }
          if (col.id === overColumn.id) {
            return { ...col, tasks: [...(col.tasks || []), taskToMove] };
          }
          return col;
        })
      );
    }

  };

  return (
    <>
      <h1 className="project-title">{boardTitle}</h1>
      <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={columns.map((col) => col.id)} strategy={verticalListSortingStrategy}>
          <div className="kanban-board">
            {columns.map((column) => (
              <Column key={column.id} column={column} tasks={column.tasks} onAddCard={() => addCard(column.id)} />
            ))}
            <button className="add-column" onClick={addColumn}>
              + Add another list
            </button>
          </div>
        </SortableContext>
      </DndContext>
    </>
  );
};

export default Tasks;