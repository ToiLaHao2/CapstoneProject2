import React from 'react';
import './Topbar.css';
import { FaBell } from 'react-icons/fa';
import { FaUserCircle } from 'react-icons/fa';

const Topbar = () => {
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
                <FaUserCircle className="icon" />
            </div>
        </div>
    );
};

export default Topbar;
