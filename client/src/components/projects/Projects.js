import React from "react";
import "../general/MainContentContainer.css";
import "./Projects.css";
import { useBoard } from "../../context/BoardContext";
import moment from "moment";
import { useNavigate } from "react-router-dom";


const Projects = () => {
    const { boards } = useBoard();
    const navigate = useNavigate();

    const handleProjectClick = () => {
        navigate("/Tasks"); 
    };

    const handleChatClick = () => {
        navigate("/chat");
    };

    return (
        <div className="projects-container">
            <div className="projects-list">
<<<<<<< Updated upstream
                {boards && boards.length > 0
                    ? boards.map((project, index) =>
                          <div className="project-card" key={index}>
                              <div className="project-header">
                                  <h2>
                                      {project.board_title}
                                  </h2>
                                  <span
                                      className={`project-status ${project.board_is_public
                                          ? "public"
                                          : "private"}`}
                                  >
                                      {project.board_is_public
                                          ? "public"
                                          : "private"}
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
                          </div>
                      )
                    : <div className="no-projects">
                          <p>There is no project of this time.</p>
                      </div>}
=======
                {boards.map((project, index) =>
                    <div className="project-card" key={index} onClick={() => handleProjectClick()} 
                    >
                        <div className="project-header">
                            <h2>
                                {project.board_title}
                            </h2>
                            <span
                                className={`project-status ${project.board_is_public
                                    ? "public"
                                    : "private"}`}
                            >
                                {project.board_is_public ? "public" : "private"}
                            </span>
                        </div>
                        <div className="project-details">
                            {/* <div>
                                <strong>Due Date:</strong> {project.dueDate}
                            </div>
                            <div>
                                <strong>Owner:</strong> {project.owner}
                            </div> */}
                                                        <button
                            className="chat-now-button"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleChatClick();
                            }}
                        >
                            Chat Now
                        </button>
                            <div>
                                <strong>Created At:</strong>{" "}
                                {moment(project.created_at).format(
                                    "DD/MM/YYYY HH:mm:ss"
                                )}
                            </div>

                            {/* <div>
                                <strong>Total Tasks:</strong>{" "}
                                {project.totalTasks}
                            </div>
                            <div>
                                <strong>Completed Tasks:</strong>{" "}
                                {project.completedTasks}
                            </div>
                            <div>
                                <strong>Remaining Tasks:</strong>{" "}
                                {project.totalTasks - project.completedTasks}
                            </div> */}
                        </div>
                    </div>
                )}
>>>>>>> Stashed changes
            </div>
        </div>
    );
};

export default Projects;
