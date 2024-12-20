import React, { useState, useEffect, useRef } from "react";
import "./Topbar.css";
import { FaBell } from "react-icons/fa";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Topbar = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

    const handleClickOutside = event => {
        if (
            dropdownRef.current &&
            !dropdownRef.current.contains(event.target)
        ) {
            setIsDropdownOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleNavigation = path => {
        navigate(path); // Điều hướng đến trang mong muốn
        setIsDropdownOpen(false); // Đóng dropdown sau khi điều hướng
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
                <button className="add-task-btn">+ Create New Task</button>
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
        </div>
    );
};

export default Topbar;
