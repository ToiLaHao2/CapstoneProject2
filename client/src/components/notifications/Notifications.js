import React, { useState } from "react";
import "./Notifications.css";
import { FaBell, FaCheckCircle } from "react-icons/fa";
import { useNotification } from "../../context/NotifiacationContext";

const Notifications = () => {
    const { notifications } = useNotification();
    // const [notifications, setNotifications] = useState([
    //     { id: 1, text: "New task assigned: Design UI", time: "2m ago", read: false },
    //     { id: 2, text: "Project deadline updated", time: "1h ago", read: false },
    //     { id: 3, text: "New message from Alex", time: "3h ago", read: false },
    //     { id: 4, text: "Bug reported in Dashboard", time: "5h ago", read: false },
    //     { id: 5, text: "Your task is marked as completed", time: "6h ago", read: false },
    //     { id: 6, text: "Meeting scheduled for tomorrow", time: "7h ago", read: false },
    //     { id: 7, text: "Reminder: Submit project report", time: "9h ago", read: false },
    //     { id: 8, text: "John mentioned you in a comment", time: "10h ago", read: false },
    //     { id: 9, text: "Server maintenance scheduled", time: "12h ago", read: false },
    //     { id: 10, text: "Update available: Version 2.1", time: "14h ago", read: false },
    //     { id: 11, text: "Alex uploaded new files", time: "1d ago", read: false },
    //     { id: 12, text: "System security alert", time: "2d ago", read: false },
    //     { id: 13, text: "New team member added", time: "3d ago", read: false },
    //     { id: 14, text: "Weekly report is ready", time: "4d ago", read: false },
    //     { id: 15, text: "Holiday announcement", time: "5d ago", read: false },
    //     { id: 16, text: "Your feedback request is pending", time: "6d ago", read: false },
    //     { id: 17, text: "Meeting rescheduled", time: "1w ago", read: false },
    //     { id: 18, text: "Storage limit exceeded", time: "1w ago", read: false },
    //     { id: 19, text: "New feature added: Dark Mode", time: "1w ago", read: false },
    //     { id: 20, text: "Your subscription is expiring soon", time: "2w ago", read: false },
    //     { id: 21, text: "Task deadline approaching", time: "2w ago", read: false },
    //     { id: 22, text: "New task assigned: Backend Fix", time: "2w ago", read: false },
    //     { id: 23, text: "Your leave request was approved", time: "3w ago", read: false },
    // ]);

    // const markAsRead = (id) => {
    //     setNotifications(notifications.map(n => 
    //         n.id === id ? { ...n, read: true } : n
    //     ));
    // };

    return (
        <div className="notifications-container">
            <div className="notifications-header">
                <h2><FaBell style={{ marginRight: "10px" }} /> Notifications</h2>
            </div>
            <ul className="notifications-list">
                {notifications.length === 0 ? (
                    <p className="no-notifications">You're all caught up! 🎉</p>
                ) : (
                    notifications.map(notification => (
                        <li key={notification._id} className={`notification-item ${notification.isRead === true ? 'read' : ''}`}>
                            <span>{notification.notification_message}</span>
                            <div className="notification-info">
                                <small>{notification.created_at}</small>
                                {/* {!notification.read && (
                                    <FaCheckCircle className="mark-read" onClick={() => markAsRead(notification.id)} />
                                )} */}
                            </div>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
};

export default Notifications;
