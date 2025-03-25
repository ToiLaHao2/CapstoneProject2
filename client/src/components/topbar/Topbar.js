import React, { useState, useEffect, useRef, useReducer } from "react";
import "./Topbar.css";
import { FaBell } from "react-icons/fa";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useBoard } from "../../context/BoardContext";
import { useUser } from "../../context/UserContext";

const initialState = {
    boardTitle: "",
    boardDescription: "",
    boardType: "",
};

function formReducer(state, action) {
    return {
        ...state,
        [action.name]: action.value,
    };
}

const Topbar = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const dropdownRef = useRef(null);
    const formRef = useRef(null);
    const navigate = useNavigate();
    const { logout } = useAuth();
    const { createBoard } = useBoard();
    const [state, dispatch] = useReducer(formReducer, initialState);
    const { user } = useUser();

    const { boardTitle, boardDescription, boardType } = state;

    const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

    const handleClickOutside = (event) => {
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

    const handleNavigation = (path) => {
        navigate(path); // Navigate to the desired page
        setIsDropdownOpen(false);
    };

    const handleCreateBoard = () => {
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
    };

    const handleLogout = async () => {
        await logout();
        alert("Logout successful!");
        navigate("/login");
    };

    const handleSubmitCreateBoard = async (e) => {
        e.preventDefault();
        console.log(boardType);
        if (!boardTitle || !boardDescription || boardType === "") {
            alert("Please fill all the fields!");
            return;
        }

        // Tạo board với giá trị boolean
        const res = await createBoard({
            boardTitle,
            boardDescription,
            boardType, // Giá trị boolean
        });

        if (res === "Success") {
            alert("Create board successful");

            // Đóng form sau khi gửi thành công
            setIsFormOpen(false);
            navigate("/projects");
        } else {
            alert("Failed to create board");
        }
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
                <button className="add-board-btn" onClick={handleCreateBoard}>
                    + Create New Board
                </button>
                <FaBell className="icon" />
                <div
                    className="user-icon-container"
                    onClick={toggleDropdown}
                    ref={dropdownRef}
                >
                    {/* <div className="avatar"> */}
                    {user.user_avatar_url ? (
                        <img
                            className="small-avatar-topbar"
                            src={user.user_avatar_url}
                            alt="small-avatar"
                        />
                    ) : (
                        user.user_full_name.charAt(0).toUpperCase()
                    )}
                    {/* </div> */}
                    {isDropdownOpen && (
                        <div className="dropdown-menu">
                            <button
                                className="dropdown-item"
                                onClick={() =>
                                    handleNavigation("/view-profile")
                                }
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
                                onClick={() => handleLogout()}
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Overlay and form for creating new board */}
            {isFormOpen && (
                <div className="overlay">
                    <div className="form-container" ref={formRef}>
                        <h2>Create New Board</h2>
                        <form onSubmit={handleSubmitCreateBoard}>
                            <div className="input-group">
                                <label htmlFor="boardTitle">Title:</label>
                                <input
                                    type="text"
                                    id="boardTitle"
                                    name="boardTitle"
                                    value={boardTitle}
                                    onChange={(e) => dispatch(e.target)}
                                />
                            </div>
                            <div className="input-group">
                                <label htmlFor="boardDescription">
                                    Short Description:
                                </label>
                                <input
                                    type="text"
                                    id="boardDescription"
                                    name="boardDescription"
                                    value={boardDescription}
                                    onChange={(e) => dispatch(e.target)}
                                />
                            </div>
                            <div className="input-group">
                                <label htmlFor="boardType">
                                    Type of Board:
                                </label>
                                <select
                                    id="boardType"
                                    name="boardType"
                                    value={boardType} // Giá trị hiện tại từ state (dưới dạng boolean)
                                    onChange={(e) =>
                                        dispatch({
                                            name: "boardType",
                                            value:
                                                e.target.value === "true"
                                                    ? true
                                                    : false, // Chuyển đổi thành boolean
                                        })
                                    }
                                >
                                    <option value="">Select Board Type</option>
                                    <option value="true">Public</option>
                                    <option value="false">Private</option>
                                </select>
                            </div>

                            <div className="form-actions">
                                <button type="submit" className="submit-btn">
                                    Create
                                </button>
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={handleCloseForm}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Topbar;
