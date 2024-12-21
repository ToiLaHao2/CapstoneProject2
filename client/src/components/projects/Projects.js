import React from "react";
import "../general/MainContentContainer.css"
import "./Projects.css";

const projectsData = [
    {
      title: "Project Alpha",
      status: "public",
      dueDate: "2024-12-30",
      owner: "John Doe",
      createdAt: "2024-01-15",
      totalTasks: 20,
      completedTasks: 15,
    },
    {
      title: "Project Beta",
      status: "private",
      dueDate: "2025-01-15",
      owner: "Jane Smith",
      createdAt: "2024-06-01",
      totalTasks: 18,
      completedTasks: 10,
    },
    // Add more project data here
  ];
  
  const Projects = () => {
    return (
      <div className="projects-container">
        <div className="projects-list">
          {projectsData.map((project, index) => (
            <div className="project-card" key={index}>
              <div className="project-header">
                <h2>{project.title}</h2>
                <span
                  className={`project-status ${
                    project.status === "public" ? "public" : "private"
                  }`}
                >
                  {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </span>
              </div>
              <div className="project-details">
                <div><strong>Due Date:</strong> {project.dueDate}</div>
                <div><strong>Owner:</strong> {project.owner}</div>
                <div><strong>Created At:</strong> {project.createdAt}</div>
                <div><strong>Total Tasks:</strong> {project.totalTasks}</div>
                <div><strong>Completed Tasks:</strong> {project.completedTasks}</div>
                <div><strong>Remaining Tasks:</strong> {project.totalTasks - project.completedTasks}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  export default Projects;
