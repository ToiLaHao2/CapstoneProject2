import React, { useState } from "react";
import "../general/MainContentContainer.css";
import "./Projects.css";
import { useBoard } from "../../context/BoardContext";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";

const Projects = () => {
    const { boards, deleteBoard } = useBoard();
    const navigate = useNavigate();
    const [editingProjectId, setEditingProjectId] = useState(null);
    const [editedTitle, setEditedTitle] = useState("");
    const { updateBoard } = useBoard();

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
        e.stopPropagation(); // Ngăn chặn sự kiện click lan ra ngoài input
        setEditingProjectId(null);
    };


    // const handleDeleteClick = (e, projectId) => {
    //     e.stopPropagation();
    //     console.log("Delete project:", projectId);
    // };

    const handleDeleteClick = async (e, boardId) => {
        e.stopPropagation();
        const confirmDelete = window.confirm("Are you sure you want to delete this board?");
        if (confirmDelete) {
            const result = await deleteBoard(boardId);
            if (result === "Success") {
                console.log("Board deleted successfully");
            } else {
                console.log("Failed to delete board");
            }
        }
    };


    //Ngăn chặn navigate khi click vào input
    const handleInputClick = (e) => {
        e.stopPropagation();
    };

    return (
        <div className="projects-container">
            <div className="projects-list">
                {boards && boards.length > 0 ? (
                    boards.map((project, index) => (
                        <div
                            className="project-card"
                            key={index}
                            onClick={() => handleProjectClick(project.board_title)}
                        >
                            <div className="project-card-top">
                                <div className="project-header">
                                    {editingProjectId === project.id ? (
                                        <input
                                            type="text"
                                            className="project-title-input"
                                            value={editedTitle}
                                            onChange={(e) => setEditedTitle(e.target.value)}
                                            onBlur={() => handleSaveTitle(project.id)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleSaveTitle(project.id);
                                                } else if (e.key === 'Escape') {
                                                    handleCancelEdit(e, project.id);
                                                }
                                            }}
                                            onClick={handleInputClick}
                                        />
                                    ) : (
                                        <h2 className="project-title">{project.board_title}</h2>
                                    )}
                                    <FontAwesomeIcon
                                        icon={faEdit}
                                        className="edit-icon"
                                        onClick={(e) => handleEditClick(e, project._id, project.board_title)}
                                    />

                                </div>
                                <span
                                    className={`project-status ${project.board_is_public ? "public" : "private"
                                        }`}
                                >
                                    {project.board_is_public ? "Public" : "Private"}
                                </span>
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
                                    onClick={(e) => handleDeleteClick(e, project._id)}
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