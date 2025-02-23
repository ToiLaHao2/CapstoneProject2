// import React from "react";
// import { FaExclamationCircle, FaClock, FaCalendarAlt, FaHourglassHalf } from "react-icons/fa";
// import "./MyTasks.css";

// const MyTasks = ({ tasks = [], type }) => {
//   const taskTypes = {
//     priority: { title: "Priority Tasks", color: "red", icon: <FaExclamationCircle /> },
//     upcoming: { title: "Upcoming Tasks", color: "blue", icon: <FaCalendarAlt /> },
//     overdue: { title: "Overdue Tasks", color: "yellow", icon: <FaClock /> },
//     pending: { title: "Pending Tasks", color: "gray", icon: <FaHourglassHalf /> },
//   };

//   return (
//     <div className="task-container">
//       <h2 className="task-title">
//         {taskTypes[type]?.icon} {taskTypes[type]?.title}
//       </h2>
//       <div className="task-grid">
//         {Array.isArray(tasks) && tasks.length > 0 ? (
//           tasks.map((task, index) => (
//             <div key={index} className="task-card">
//               <div className="task-content">
//                 <h3 className="task-name">{task.title}</h3>
//                 <p className="task-desc">{task.description}</p>
//                 <div className="task-footer">
//                   <span className={`task-badge ${taskTypes[type]?.color}`}>{type}</span>
//                   <span className="task-date">{task.dueDate}</span>
//                 </div>
//               </div>
//             </div>
//           ))
//         ) : (
//           <p className="no-tasks">No tasks available.</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default MyTasks;


import React from "react";
import { FaExclamationCircle, FaClock, FaCalendarAlt, FaHourglassHalf } from "react-icons/fa";
import "./MyTasks.css";

const sampleTasks = [
  // Priority Tasks
  { title: "Fix Critical Bug", project: "Project Alpha", description: "Resolve crash issue on login.", dueDate: "2025-02-25", type: "priority" },
  { title: "Deploy Backend", project: "Project Beta", description: "Push latest updates to production.", dueDate: "2025-02-26", type: "priority" },
  { title: "Optimize Database", project: "Project Gamma", description: "Reduce query response time.", dueDate: "2025-02-27", type: "priority" },
  { title: "Security Patch", project: "Project Delta", description: "Apply urgent security updates.", dueDate: "2025-02-28", type: "priority" },

  // Upcoming Tasks
  { title: "Update UI Components", project: "Project Alpha", description: "Refactor button and input styles.", dueDate: "2025-03-01", type: "upcoming" },
  { title: "Database Migration", project: "Project Beta", description: "Migrate to new DB schema.", dueDate: "2025-03-02", type: "upcoming" },
  { title: "User Feedback Review", project: "Project Gamma", description: "Analyze user suggestions.", dueDate: "2025-03-03", type: "upcoming" },
  { title: "Team Meeting", project: "Project Delta", description: "Discuss Q2 roadmap.", dueDate: "2025-03-04", type: "upcoming" },

  // Overdue Tasks
  { title: "Review PR #42", project: "Project Alpha", description: "Check the latest code merge request.", dueDate: "2025-02-20", type: "overdue" },
  { title: "Security Audit", project: "Project Beta", description: "Perform security vulnerability check.", dueDate: "2025-02-21", type: "overdue" },
  { title: "Fix API Timeout", project: "Project Gamma", description: "Resolve slow API response issue.", dueDate: "2025-02-22", type: "overdue" },
  { title: "Update Dependencies", project: "Project Delta", description: "Upgrade outdated packages.", dueDate: "2025-02-23", type: "overdue" },

  // Pending Tasks
  { title: "Write API Docs", project: "Project Alpha", description: "Document REST API endpoints.", dueDate: "2025-03-05", type: "pending" },
  { title: "Test Payment Flow", project: "Project Beta", description: "Ensure Stripe payments work correctly.", dueDate: "2025-03-06", type: "pending" },
  { title: "Bug Triage", project: "Project Gamma", description: "Categorize reported issues.", dueDate: "2025-03-07", type: "pending" },
  { title: "Refactor Codebase", project: "Project Delta", description: "Improve project maintainability.", dueDate: "2025-03-08", type: "pending" },
];

const taskTypes = {
  priority: { title: "Priority Tasks", color: "red", icon: <FaExclamationCircle /> },
  upcoming: { title: "Upcoming Tasks", color: "blue", icon: <FaCalendarAlt /> },
  overdue: { title: "Overdue Tasks", color: "yellow", icon: <FaClock /> },
  pending: { title: "Pending Tasks", color: "gray", icon: <FaHourglassHalf /> },
};

const MyTasks = () => {
  return (
    <div className="task-container">
      {Object.keys(taskTypes).map((type) => (
        <div key={type} className="task-section">
          <h2 className="task-title">
            {taskTypes[type].icon} {taskTypes[type].title}
          </h2>
          <div className="task-grid">
            {sampleTasks
              .filter((task) => task.type === type)
              .map((task, index) => (
                <div key={index} className="task-card">
                  <div className="task-content">
                    <h3 className="task-name">{task.title}</h3>
                    <p className="task-project"><strong>Project:</strong> {task.project}</p>
                    <p className="task-desc">{task.description}</p>
                    <div className="task-footer">
                      <span className={`task-badge ${taskTypes[type].color}`}>{type}</span>
                      <span className="task-date">{task.dueDate}</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MyTasks;

