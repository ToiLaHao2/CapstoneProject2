import React from "react";
import "../general/MainContentContainer.css";
import "./Projects.css";
import { useBoard } from "../../context/BoardContext";
import moment from "moment";

const Projects = () => {
    const { boards } = useBoard();

    return (
        <div className="projects-container">
            <div className="projects-list">
                {boards.map((project, index) =>
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
            </div>
        </div>
    );
};

export default Projects;
