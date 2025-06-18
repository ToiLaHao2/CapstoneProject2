import React, { createContext, useState, useContext, useEffect } from "react";
import privateAxios from "../api/privateAxios";
import { useSocket } from "./SocketContext";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const { socket, connected } = useSocket();
    // const [unread, setUnread] = useState(0);

    // Fetch notifications from the backend
    const fetchNotifications = async (beforeId = null) => {
        try {
            const { data } = await privateAxios.post("/notification/getNotification", {
                beforeId: beforeId,
                checkMessage: "Get notification"
            });
            if (data.success) {
                setNotifications((prev) => [...prev, ...data.data]);
            }
        } catch (err) {
            console.error("Fetch notifications error", err);
        }
    };

    // Mark a specific notification as read
    const markNotificationRead = async (notificationId) => {
        try {
            const { data } = await privateAxios.post("/notification/markNotificatioRead", {
                notificationId: notificationId,
                checkMessage: "Mark notification read"
            });
            if (data.success) {
                setNotifications((prev) =>
                    prev.map((noti) =>
                        noti.notiId === notificationId
                            ? { ...noti, isRead: true }
                            : noti
                    )
                );
            }
        } catch (err) {
            console.error("Mark notification as read error", err);
        }
    };

    // Mark all notifications as read
    const markAllNotificationsRead = async () => {
        try {
            const { data } = await privateAxios.post("/notification/markAllRead", {
                checkMessage: "Mark all notification read"
            });
            if (data.success) {
                setNotifications((prev) =>
                    prev.map((noti) => ({ ...noti, noti: true }))
                );
            }
        } catch (err) {
            console.error("Mark all notifications as read error", err);
        }
    };

    useEffect(() => {
        if (!connected) return;

        const handler = (payload) => {
            console.log(payload);
            setNotifications((prev) => [payload, ...prev]);
        };

        socket.on("notification:new", handler);
        return () => socket.off("notification:new", handler);
    }, [connected, socket]);

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                fetchNotifications,
                markNotificationRead,
                markAllNotificationsRead,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => useContext(NotificationContext);
