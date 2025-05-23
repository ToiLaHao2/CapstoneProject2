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
import { useUser } from "../../context/UserContext";

const Projects = () => {
    const {
        boards,
        deleteBoard,
        updateBoard,
        addMemberToBoard,
        updatePrivacy,
        removeMemberFromBoard,
        getAllBoardsByUserId
    } = useBoard();
    const { user, searchUsers, colorHashMap } = useUser();
    const navigate = useNavigate();

    const [editingProjectId, setEditingProjectId] = useState(null);
    const [editedTitle, setEditedTitle] = useState("");

    const [menuVisibleProjectId, setMenuVisibleProjectId] = useState(null);
    const menuRef = useRef(null);

    const [isAddMembersPopupOpen, setIsAddMembersPopupOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [currentBoardId, setCurrentBoardId] = useState(null);
    const [user_to_add, setUserToAdd] = useState(null);

    const openAddMembersPopup = () => setIsAddMembersPopupOpen(true);
    const closeAddMembersPopup = () => setIsAddMembersPopupOpen(false);

    const [userMenuVisibleId, setUserMenuVisibleId] = useState(null);
    const userMenuRef = useRef({});

    const [selectedCollaborator, setSelectedCollaborator] = useState(null);
    const [boardMenuVisibleId, setBoardMenuVisibleId] = useState(null);

    const [selectedCollaboratorToRemove, setSelectedCollaboratorToRemove] = useState(null);

    const [removeSuccessDialogOpen, setRemoveSuccessDialogOpen] = useState(false);
    const openRemoveSuccessDialog = () => setRemoveSuccessDialogOpen(true);
    const closeRemoveSuccessDialog = () => setRemoveSuccessDialogOpen(false);

    // search user to add to
    const handleSearchChange = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query.length > 0) {
            try {
                const results = await searchUsers(user._id, query);
                setSearchResults(results);
            } catch (error) {
                console.error("Error searching users:", error);
                setSearchResults([]);
            }
        } else {
            setSearchResults([]);
        }
    };

    // click suggest user then add to the input search
    const handleSuggestionClick = (user) => {
        setSearchQuery(user.user_email);
        setUserToAdd(user);
        setSearchResults([]);
    };

    // add members
    const handleAddMember = async () => {
        try {
            console.log("currentBoardId:", currentBoardId);
            console.log("memberId:", user_to_add._id);

            const result = await addMemberToBoard(
                currentBoardId,
                user_to_add._id,
                "VIEWER"
            );
            if (result === "Success") {
                console.log("Member added successfully");
                closeAddMembersPopup();
            } else {
                console.error("Failed to add member");
            }
        } catch (error) {
            console.error("Error adding member:", error);
        }
    };

    const handleProjectClick = (boardTitle, board_id) => {
        navigate("/Tasks", { state: { boardTitle, board_id } });
    };

    const handleChatClick = () => {
        navigate("/chat");
    };

    //edit board title
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
        e.stopPropagation();

        const newPrivacy = !currentPrivacy;
        const result = await updatePrivacy(boardId, newPrivacy);
        if (result === "Success") {
            console.log("Privacy updated successfully");
        } else {
            console.log("Failed to update privacy");
        }
    };

    const handleAddMembersClick = async (e, boardId) => {
        setCurrentBoardId(boardId);
        openAddMembersPopup();
    };

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

    // remove member
    const handleRemoveMemberClick = async (collaborator) => {
        console.log("Removing collaborator:", collaborator);
        console.log("currentBoardId when removing:", currentBoardId);
        console.log("collaborator._boardId:", collaborator?._boardId);
        console.log("collaborator._id:", collaborator?._id);
        closeUserMenu();
        setSelectedCollaboratorToRemove(collaborator);
        const confirmRemove = window.confirm(
            `Are you sure you want to remove ${collaborator.user_full_name} from this board?`
        );
        if (confirmRemove) {
            if (collaborator?._boardId && collaborator?._id) {
                const result = await removeMemberFromBoard(collaborator._boardId, collaborator._id);
                if (result === "Success") {
                    console.log("Member removed successfully");
                    openRemoveSuccessDialog();

                    //fetch lại boards từ context
                    getAllBoardsByUserId();
                } else {
                    console.error("Failed to remove member");
                }
            } else {
                console.error("Board ID or collaborator ID is missing for removal.");
            }
        }
    };

    const toggleUserMenu = (e, collaborator) => {
        e.stopPropagation();
        console.log("Toggling user menu for collaborator:", collaborator);
        // Giả định collaborator._id là user_id
        console.log("Toggling user menu for user_id:", collaborator?._id);
        // Lấy board_id từ project._id của vòng lặp map bên ngoài
        const boardId = collaborator?._boardId; // Truyền thêm _boardId khi map
        if (collaborator?._id && boardId) {
            setCurrentBoardId(boardId);
            setSelectedCollaborator(collaborator);
            setUserMenuVisibleId(
                userMenuVisibleId === collaborator._id ? null : collaborator._id
            );
            setBoardMenuVisibleId(null);
        } else {
            console.error("Collaborator is missing _id (as user_id) or _boardId:", collaborator, boardId);
        }
    };

    const closeUserMenu = () => {
        setUserMenuVisibleId(null);
        setSelectedCollaborator(null);
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
                                        className={`project-status ${project.board_is_public
                                            ? "public"
                                            : "private"
                                            }`}
                                    >
                                        {project.board_is_public
                                            ? "Public"
                                            : "Private"}
                                    </span>
                                    {/* Conditionally render user icons */}
                                    <div className="project-users-icons">
                                        {project.board_collaborators.map((collaborator, index) => {
                                            console.log("Inside map - collaborator:", collaborator);
                                            collaborator._boardId = project._id;
                                            return (
                                                <React.Fragment key={index}>
                                                    {collaborator?.user_avatar_url !== "empty" ? (
                                                        <img
                                                            className="user-icon-circle"
                                                            src={collaborator.user_avatar_url}
                                                            alt="small-avatar"
                                                            onClick={(e) => {
                                                                console.log("Before toggleUserMenu - collaborator:", collaborator);
                                                                toggleUserMenu(e, collaborator);
                                                            }}
                                                        />
                                                    ) : (
                                                        <div
                                                            className="user-icon-circle"
                                                            style={{
                                                                backgroundColor: `${colorHashMap[
                                                                    collaborator?.user_full_name
                                                                        ?.charAt(0)
                                                                        ?.toUpperCase()
                                                                ]}`,
                                                                color: "white",
                                                            }}
                                                            onClick={(e) => {
                                                                console.log("Before toggleUserMenu - collaborator:", collaborator);
                                                                toggleUserMenu(e, collaborator);
                                                            }}
                                                        >
                                                            {collaborator?.user_full_name
                                                                ?.charAt(0)
                                                                ?.toUpperCase()}
                                                        </div>
                                                    )}
                                                    {userMenuVisibleId === collaborator?._id && (
                                                        <div className="dropdown-menu user-dropdown" ref={(el) => (userMenuRef.current[collaborator?._id] = el)}>
                                                            <div className="dropdown-item">
                                                                <b>Member: {collaborator?.user_full_name}</b>
                                                            </div>
                                                            <div className="dropdown-item" onClick={() => handleRemoveMemberClick(collaborator)}>
                                                                Remove from board
                                                            </div>
                                                        </div>
                                                    )}
                                                </React.Fragment>
                                            );
                                        })}
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
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setCurrentBoardId(
                                                        project._id
                                                    );
                                                    openAddMembersPopup();
                                                }}
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
                                        Chat
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

            {/* Popup "Add Members" */}
            {isAddMembersPopupOpen && (
                <div className="add-members-popup-overlay">
                    <div className="add-members-popup">
                        <input
                            type="text"
                            placeholder="Search user email"
                            value={searchQuery}
                            onChange={handleSearchChange}
                        />
                        <ul className="search-results">
                            {console.log("searchResults:", searchResults)}
                            {searchResults.map((user) => (
                                <li
                                    key={user._id}
                                    onClick={() => handleSuggestionClick(user)}
                                >
                                    {user.user_email}
                                </li>
                            ))}
                        </ul>
                        <button onClick={closeAddMembersPopup}>Close</button>
                        {/* <button className="button-add" onClick={() => handleAddMember()}>Add</button> */}
                        <button
                            className="button-add"
                            onClick={() => {
                                console.log("Truy vấn tìm kiếm:", searchQuery);
                                console.log("Kết quả tìm kiếm:", searchResults);
                                // const selectedUser = searchResults.find(
                                //     (user) => user.user_email === searchQuery
                                // );
                                if (user_to_add !== null) {
                                    handleAddMember();
                                } else {
                                    console.error("No user selected.");
                                }
                            }}
                        >
                            Add
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Projects;
