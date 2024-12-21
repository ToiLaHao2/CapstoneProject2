import React, { useState, useEffect, useRef } from "react";
import "./Topbar.css";
import { FaBell } from "react-icons/fa";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Topbar = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false); 
    const dropdownRef = useRef(null);
    const formRef = useRef(null);  
    const navigate = useNavigate();

    const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

    const handleClickOutside = event => {
        if (
            dropdownRef.current &&
            !dropdownRef.current.contains(event.target)
        ) {
            setIsDropdownOpen(false);
        }

        if (
            formRef.current &&
            !formRef.current.contains(event.target) &&
            isFormOpen
        ) {
            setIsFormOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }); 

    const handleNavigation = path => {
        navigate(path); // Navigate to the desired page
        setIsDropdownOpen(false); 
    };

    const handleCreateBoard = () => {
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
    };

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
                <button className="add-board-btn" onClick={handleCreateBoard}>+ Create New Board</button>
                <FaBell className="icon" />
                <div
                    className="user-icon-container"
                    onClick={toggleDropdown}
                    ref={dropdownRef}
                >
                    <FaUserCircle className="icon" />
                    {isDropdownOpen &&
                        <div className="dropdown-menu">
                            <button
                                className="dropdown-item"
                                onClick={() =>
                                    handleNavigation("/view-profile")}
                            >
                                View Profile
                            </button>
                            <button
                                className="dropdown-item"
                                onClick={() => handleNavigation("/settings")}
                            >
                                Settings
                            </button>
                            <button
                                className="dropdown-item"
                                onClick={() => handleNavigation("/logout")}
                            >
                                Logout
                            </button>
                        </div>}
                </div>
            </div>

            {/* Overlay and form for creating new board */}
            {isFormOpen && (
                <div className="overlay">
                    <div className="form-container" ref={formRef}>
                        <h2>Create New Board</h2>
                        <form>
                            <div className="input-group">
                                <label htmlFor="boardName">Board Name:</label>
                                <input type="text" id="boardName" name="boardName" />
                            </div>
                            <div className="input-group">
                                <label htmlFor="boardType">Type of Board:</label>
                                <select id="boardType" name="boardType">
                                    <option value="public">Public</option>
                                    <option value="private">Private</option>
                                </select>
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="submit-btn">Create</button>
                                <button type="button" className="cancel-btn" onClick={handleCloseForm}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Topbar;
