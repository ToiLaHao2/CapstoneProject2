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
            </div>
        </div>
    );
};

export default Projects;
