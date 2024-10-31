import React from 'react';
import TaskCard from '../taskcard/TaskCard';
import './TaskColumn.css';

const TaskColumn = ({ title, color }) => (
  <div className={`task-column ${color}`}>
    <h2>{title}</h2>
    <TaskCard />
    <TaskCard />
    <TaskCard />
  </div>
);

export default TaskColumn;
