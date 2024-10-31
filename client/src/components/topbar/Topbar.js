// Topbar.js
import React from 'react';
import { FaBell, FaUser } from 'react-icons/fa';
import './Topbar.css';

const Topbar = () => {
  return (
    <div className="topbar">
      <div className="search-container">
        <input type="text" placeholder="Search" className="search-input" />
        <button className="search-icon">&#128269;</button>
      </div>
      <div className="topbar-icons">
        <FaBell className="notification-icon" />
        <FaUser className="user-icon" />
      </div>
    </div>
  );
};

export default Topbar;
