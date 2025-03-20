import React, { useState, useRef, useEffect } from "react";
import "../general/MainContentContainer.css";
import "./Projects.css";
import { useBoard } from "../../context/BoardContext";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faEdit,
    faBars,
    faLock,
    faLockOpen,
    faUserPlus,
    faTrash,
} from "@fortawesome/free-solid-svg-icons";

const Projects = () => {
    const {
        boards,
        deleteBoard,
        updateBoard,
        addMemberToBoard,
        updatePrivacy,
        colorHashMap,
    } = useBoard();
    const navigate = useNavigate();
    const [editingProjectId, setEditingProjectId] = useState(null);
    const [editedTitle, setEditedTitle] = useState("");
    const [menuVisibleProjectId, setMenuVisibleProjectId] = useState(null);
    const menuRef = useRef(null);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [suggestedUsers, setSuggestedUsers] = useState([
        { _id: "1", user_full_name: "Alice" },
        { _id: "2", user_full_name: "Bob" },
        { _id: "3", user_full_name: "Charlie" },
    ]);

    const openPopup = () => setIsPopupOpen(true);
    const closePopup = () => setIsPopupOpen(false);

    const handleAddMembers = (selectedUsers) => {
        console.log("Added Users:", selectedUsers);
        closePopup();
    };

    const handleProjectClick = (boardTitle, board_id) => {
        navigate("/Tasks", { state: { boardTitle, board_id } });
    };

    const handleChatClick = () => {
        navigate("/chat");
    };

    const handleEditClick = async (e, boardId) => {
        e.stopPropagation();
        const newTitle = prompt("Enter new board title:");
        if (newTitle) {
            const result = await updateBoard(boardId, newTitle);
            console.log(result);
        }
    };

    const handleSaveTitle = (projectId) => {
        setEditingProjectId(null);
        console.log(`Project ID: ${projectId}, New Title: ${editedTitle}`);
    };

    const handleCancelEdit = (e, projectId) => {
        e.stopPropagation();
        setEditingProjectId(null);
    };

    const handlePrivacyClick = async (e, boardId, currentPrivacy) => {
        console.log("work");
        e.stopPropagation();
        console.log(
            "Clicked Privacy:",
            boardId,
            "Current Privacy:",
            currentPrivacy
        );

        const newPrivacy = !currentPrivacy;
        const result = await updatePrivacy(boardId, newPrivacy);
        if (result === "Success") {
            console.log("Privacy updated successfully");
        } else {
            console.log("Failed to update privacy");
        }
    };

    const handleAddMembersClick = async (e, boardId) => {};

    const handleDeleteClick = async (e, boardId) => {
        e.stopPropagation();
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this board?"
        );
        if (confirmDelete) {
            const result = await deleteBoard(boardId);
            if (result === "Success") {
                console.log("Board deleted successfully");
            } else {
                console.log("Failed to delete board");
            }
        }
        closeMenu();
    };

    const handleInputClick = (e) => {
        e.stopPropagation();
    };

    const toggleMenu = (e, boardId) => {
        e.stopPropagation();
        console.log("Toggling menu for:", boardId);
        setMenuVisibleProjectId(
            menuVisibleProjectId === boardId ? null : boardId
        );
    };

    const closeMenu = () => {
        setMenuVisibleProjectId(null);
    };

    //Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            console.log("Click event:", event.target);
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                closeMenu();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuRef]);

    return (
        <div className="projects-container">
            <div className="projects-list">
                {boards && boards.length > 0 ? (
                    boards.map((project, index) => (
                        <div
                            className="project-card"
                            key={index}
                            onClick={() =>
                                handleProjectClick(
                                    project.board_title,
                                    project._id
                                )
                            }
                        >
                            <div className="project-card-top">
                                <div className="project-header">
                                    {editingProjectId === project._id ? (
                                        <input
                                            type="text"
                                            className="project-title-input"
                                            value={editedTitle}
                                            onChange={(e) =>
                                                setEditedTitle(e.target.value)
                                            }
                                            onBlur={() =>
                                                handleSaveTitle(project._id)
                                            }
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    handleSaveTitle(
                                                        project._id
                                                    );
                                                } else if (e.key === "Escape") {
                                                    handleCancelEdit(
                                                        e,
                                                        project._id
                                                    );
                                                }
                                            }}
                                            onClick={handleInputClick}
                                        />
                                    ) : (
                                        <h2 className="project-title">
                                            {project.board_title}
                                        </h2>
                                    )}
                                    <FontAwesomeIcon
                                        icon={faEdit}
                                        className="edit-icon"
                                        onClick={(e) =>
                                            handleEditClick(
                                                e,
                                                project._id,
                                                project.board_title
                                            )
                                        }
                                    />
                                </div>
                                <div className="project-status-and-users">
                                    <span
                                        className={`project-status ${
                                            project.board_is_public
                                                ? "public"
                                                : "private"
                                        }`}
                                    >
                                        {project.board_is_public
                                            ? "Public"
                                            : "Private"}
                                    </span>
                                    {/* Conditionally render user icons - for now always showing static icons */}
                                    <div className="project-users-icons">
                                        {project.board_collaborators.length >
                                            0 &&
                                            project.board_collaborators.map(
                                                (collaborator, index) => (
                                                    <div
                                                        key={index}
                                                        className="user-icon-circle"
                                                        style={{
                                                            backgroundColor: `${
                                                                colorHashMap[
                                                                    collaborator.user_full_name
                                                                        .charAt(
                                                                            0
                                                                        )
                                                                        .toUpperCase()
                                                                ]
                                                            }`,
                                                            color: "white",
                                                        }}
                                                    >
                                                        {collaborator.user_full_name
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </div>
                                                )
                                            )}
                                    </div>
                                </div>

                                <div className="menu-icon-container">
                                    <FontAwesomeIcon
                                        icon={faBars}
                                        className="menu-bar-icon"
                                        onClick={(e) =>
                                            toggleMenu(e, project._id)
                                        }
                                    />
                                    {menuVisibleProjectId === project._id && (
                                        <div
                                            className="dropdown-menu"
                                            ref={menuRef}
                                        >
                                            <div
                                                className="dropdown-item"
                                                onClick={(e) =>
                                                    handlePrivacyClick(
                                                        e,
                                                        project._id,
                                                        project.board_is_public
                                                    )
                                                }
                                            >
                                                <FontAwesomeIcon
                                                    icon={
                                                        project.board_is_public
                                                            ? faLockOpen
                                                            : faLock
                                                    }
                                                    className="dropdown-icon"
                                                />
                                                {project.board_is_public
                                                    ? "Change to Private"
                                                    : "Change to Public"}
                                            </div>
                                            <div
                                                className="dropdown-item"
                                                onClick={(e) => openPopup()}
                                            >
                                                <FontAwesomeIcon
                                                    icon={faUserPlus}
                                                    className="dropdown-icon"
                                                />
                                                Add Members
                                            </div>
                                            <div
                                                className="dropdown-item delete"
                                                onClick={(e) =>
                                                    handleDeleteClick(
                                                        e,
                                                        project._id
                                                    )
                                                }
                                            >
                                                <FontAwesomeIcon
                                                    icon={faTrash}
                                                    className="dropdown-icon"
                                                />
                                                Delete Project
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="project-details">
                                <div>
                                    <strong>Created At:</strong>{" "}
                                    {moment(project.created_at).format(
                                        "DD/MM/YYYY HH:mm:ss"
                                    )}
                                </div>
                            </div>

                            <div className="project-card-bottom">
                                {project.board_is_public && (
                                    <button
                                        className="chat-now-button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleChatClick();
                                        }}
                                    >
                                        Chat Now
                                    </button>
                                )}
                                <button
                                    className="delete-button"
                                    onClick={(e) =>
                                        handleDeleteClick(e, project._id)
                                    }
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-projects">
                        <p>There is no project at this time.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Projects;
