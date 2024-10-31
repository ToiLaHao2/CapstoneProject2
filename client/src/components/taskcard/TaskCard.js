import React from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import './TaskCard.css';

const TaskCard = () => (
  <div className="task-card">
    <img src="https://via.placeholder.com/40" alt="User" className="profile-img" />
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
    <div className="task-actions">
      <FaEdit />
      <FaTrash />
    </div>
  </div>
);

export default TaskCard;
