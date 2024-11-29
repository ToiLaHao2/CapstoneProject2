import React, { useState, useEffect, useRef } from 'react';
import './Topbar.css';
import { FaBell } from 'react-icons/fa';
import { FaUserCircle } from 'react-icons/fa';

const Topbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="topbar">
      <div className="search-container">
        <input
          type="text"
          className="search-box"
          placeholder="Search Task"
        />
      </div>
      <div className="right-icons">
        <button className="add-task-btn">+ Create New Task</button>
        <FaBell className="icon" />
        <div 
          className="user-icon-container" 
          onClick={toggleDropdown}
          ref={dropdownRef}
        >
          <FaUserCircle className="icon" />
          {isDropdownOpen && (
            <div className="dropdown-menu">
              <a href="/view-profile" className="dropdown-item">View Profile</a>
              <a href="/settings" className="dropdown-item">Settings</a>
              <a href="/logout" className="dropdown-item">Logout</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Topbar;
