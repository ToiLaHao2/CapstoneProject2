import React from 'react';
import TaskColumn from '../taskcolum/TaskColumn';
import './Taskboard.css'

const TaskBoard = () => (
  <div className="task-board">
    <h1>Tasks</h1>
    <div className="task-columns">
      <TaskColumn title="To do" color="blue" />
      <TaskColumn title="In progress" color="orange" />
      <TaskColumn title="Done" color="red" />
    </div>
  </div>
);

export default TaskBoard;
