// import React, { useState } from "react";
// import "./Sidebar.css";

// import { FaHome, FaFolder, FaTasks, FaCalendarAlt } from "react-icons/fa";
// import { IoMdChatbubbles } from "react-icons/io";
// import { IoLogOut } from "react-icons/io5";

// import { Link, useNavigate } from "react-router-dom";
// import { useAuth } from "../../context/AuthContext";

// const Sidebar = () => {
//     const [active, setActive] = useState('Dashboard');
//     const { logout } = useAuth();
//     const navigate = useNavigate();

//     const handleClick = option => {
//         setActive(option);
//     };

//     const handleLogout = async () => {
//         await logout();
//         alert("Logout successful!");
//         navigate("/login");
//     };

//     return (
//         <div className="sidebar">
//             <h2>TaskMinder.</h2>
//             <nav>
//                 <Link
//                     to="/dashboard"
//                     className={active === "Dashboard" ? "active" : ""}
//                     onClick={() => handleClick("Dashboard")}
//                 >
//                     <FaHome style={{ marginRight: "10px" }} /> Dashboard
//                 </Link>

//                 <Link
//                     to="/projects"
//                     className={active === "Projects" ? "active" : ""}
//                     onClick={() => handleClick("Projects")}
//                 >
//                     <FaFolder style={{ marginRight: "10px" }} /> Projects
//                 </Link>

//                 <Link
//                     to="/tasks"
//                     className={active === "Tasks" ? "active" : ""}
//                     onClick={() => handleClick("Tasks")}
//                 >
//                     <FaTasks style={{ marginRight: "10px" }} /> Tasks
//                 </Link>

//                 <Link
//                     to="/calendar"
//                     className={active === "Calendar" ? "active" : ""}
//                     onClick={() => handleClick("Calendar")}
//                 >
//                     <FaCalendarAlt style={{ marginRight: "10px" }} /> Calendar
//                 </Link>

//                 <Link
//                     to="/chat"
//                     className={active === "Chat" ? "active" : ""}
//                     onClick={() => handleClick("Chat")}
//                 >
//                     <IoMdChatbubbles style={{ marginRight: "10px" }} /> Chat
//                 </Link>
//             </nav>
//             <button className="logout" onClick={handleLogout}>
//                 {" "}<IoLogOut style={{ marginRight: "10px" }} />Log out
//             </button>
//         </div>
//     );
// };

// export default Sidebar;


import React, { useState } from "react";
import "./Sidebar.css";

import { FaHome, FaFolder, FaTasks, FaCalendarAlt, FaBell } from "react-icons/fa";
import { IoMdChatbubbles } from "react-icons/io";
import { IoLogOut } from "react-icons/io5";

import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Sidebar = () => {
    const [active, setActive] = useState('Dashboard');
    const [notifications, setNotifications] = useState(3); // Số lượng thông báo chưa đọc
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleClick = option => {
        setActive(option);
    };

    const handleLogout = async () => {
        await logout();
        alert("Logout successful!");
        navigate("/login");
    };

    return (
        <div className="sidebar">
            <h2>TaskMinder.</h2>
            <nav>
                <Link
                    to="/dashboard"
                    className={active === "Dashboard" ? "active" : ""}
                    onClick={() => handleClick("Dashboard")}
                >
                    <FaHome style={{ marginRight: "10px" }} /> Dashboard
                </Link>

                <Link
                    to="/projects"
                    className={active === "Projects" ? "active" : ""}
                    onClick={() => handleClick("Projects")}
                >
                    <FaFolder style={{ marginRight: "10px" }} /> Projects
                </Link>

                <Link
                    to="/tasks"
                    className={active === "Tasks" ? "active" : ""}
                    onClick={() => handleClick("Tasks")}
                >
                    <FaTasks style={{ marginRight: "10px" }} /> Tasks
                </Link>

                <Link
                    to="/calendar"
                    className={active === "Calendar" ? "active" : ""}
                    onClick={() => handleClick("Calendar")}
                >
                    <FaCalendarAlt style={{ marginRight: "10px" }} /> Calendar
                </Link>

                <Link
                    to="/chat"
                    className={active === "Chat" ? "active" : ""}
                    onClick={() => handleClick("Chat")}
                >
                    <IoMdChatbubbles style={{ marginRight: "10px" }} /> Chat
                </Link>

                <Link
                    to="/notifications"
                    className={active === "Notifications" ? "active notification-link" : "notification-link"}
                    onClick={() => {
                        setActive("Notifications");
                        setNotifications(0); // Đánh dấu đã đọc
                    }}
                >
                    <FaBell style={{ marginRight: "10px" }} /> Notifications
                    {notifications > 0 && <span className="notification-badge">{notifications}</span>}
                </Link>
            </nav>
            <button className="logout" onClick={handleLogout}>
                {" "}<IoLogOut style={{ marginRight: "10px" }} /> Log out
            </button>
        </div>
    );
};

export default Sidebar;
