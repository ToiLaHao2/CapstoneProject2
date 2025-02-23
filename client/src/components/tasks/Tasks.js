import React from "react";
import "../general/MainContentContainer.css"
import "./Tasks.css";

const tasks = [
  { id: 1, title: 'Model Answer', tag: 'Design', status: 'Backlog', users: ['User1', 'User2'], comments: 2, files: 3 },
  { id: 2, title: 'Create calendar, chat and email app pages', tag: 'Development', status: 'Backlog', users: ['User3', 'User4'], comments: 4, files: 2 },
  { id: 3, title: 'Improve search functionality', tag: 'Development', status: 'Backlog', users: ['User5', 'User6'], comments: 1, files: 1 },
  { id: 13, title: 'Update user permissions', tag: 'Security', status: 'Backlog', users: ['User7'], comments: 2, files: 1 },
  { id: 14, title: 'Refactor login module', tag: 'Development', status: 'Backlog', users: ['User8', 'User9'], comments: 3, files: 2 },
  { id: 15, title: 'Research analytics tools', tag: 'Analysis', status: 'Backlog', users: ['User10'], comments: 1, files: 0 },
  { id: 4, title: 'Add authentication pages', tag: 'Development', status: 'To Do', users: ['User5'], comments: 1, files: 1 },
  { id: 5, title: 'Profile Page Saturation', tag: 'Design', status: 'To Do', users: ['User7', 'User8'], comments: 2, files: 4 },
  { id: 6, title: 'Review user feedback', tag: 'Review', status: 'To Do', users: ['User9'], comments: 3, files: 1 },
  { id: 7, title: 'Model Answer', tag: 'Review', status: 'In Process', users: ['User6', 'User7'], comments: 3, files: 2 },
  { id: 8, title: 'Create design prototype', tag: 'Design', status: 'In Process', users: ['User8', 'User9'], comments: 5, files: 1 },
  { id: 9, title: 'Optimize performance', tag: 'Development', status: 'In Process', users: ['User10'], comments: 2, files: 3 },
  { id: 10, title: 'Finalize product features', tag: 'Development', status: 'Done', users: ['User10'], comments: 0, files: 0 },
  { id: 11, title: 'Submit project report', tag: 'Documentation', status: 'Done', users: ['User11', 'User12'], comments: 2, files: 4 },
  { id: 12, title: 'Launch marketing campaign', tag: 'Marketing', status: 'Done', users: ['User13', 'User14'], comments: 1, files: 2 }
];

const TaskCard = ({ title, tag, users, comments, files }) => {
  return (
    <div className="task-card">
      <h3 className="task-title">{title}</h3>
      <span className="task-tag">{tag}</span>
      <div className="task-info">
        <div className="task-users">
          {users.map((user, index) => (
            <span key={index} className="user-avatar">
              {user}
            </span>
          ))}
        </div>
        <div className="task-meta">
          <span className="task-comments">{comments} comments</span>
          <span className="task-files">{files} files</span>
        </div>
      </div>
    </div>
  );
};

const Column = ({ title, tasks }) => {
  return (
    <div className="column">
      <h2 className="column-title">{title}</h2>
      <div className="task-list">
        {tasks.map((task) => (
          <TaskCard key={task.id} {...task} />
        ))}
      </div>
    </div>
  );
};

const Tasks = () => {
  const groupedTasks = tasks.reduce((groups, task) => {
    if (!groups[task.status]) {
      groups[task.status] = [];
    }
    groups[task.status].push(task);
    return groups;
  }, {});

  return (
    <>
      <div>
        <h1 className="project-title">Project Task Management</h1>
      </div>
      <div className="kanban-board">
        {Object.entries(groupedTasks).map(([status, tasks]) => (
          <Column key={status} title={status} tasks={tasks} />
        ))}
      </div>
    </>

  );
};

export default Tasks;
