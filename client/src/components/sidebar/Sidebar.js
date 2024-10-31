import React from 'react';
import './Sidebar.css';
import { FaHome, FaFolder, FaTasks, FaCalendarAlt } from 'react-icons/fa';

const Sidebar = () => (
  <div className="sidebar">
    <h2>TaskMinder.</h2>
    <nav>
    <a href="#"><FaHome style={{ marginRight: '10px' }} /> Dashboard</a>
    <a href="#"><FaFolder style={{ marginRight: '10px' }} /> Projects</a>
      <a href="#" className="active"><FaTasks style={{ marginRight: '10px' }} /> Tasks</a>
      <a href="#"><FaCalendarAlt style={{ marginRight: '10px' }} /> Calendar</a>
    </nav>
    <button className="logout">Log out</button>
  </div>
);

export default Sidebar;
