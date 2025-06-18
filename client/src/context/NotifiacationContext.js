import React, { createContext, useState, useContext, useEffect } from "react";
import privateAxios from "../api/privateAxios";
import { useSocket } from "./SocketContext";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const { socket, connected } = useSocket();
    // const [unread, setUnread] = useState(0);

    // useEffect(() => {
    //     (async () => {
    //         try {
    //             const { data } = await privateAxios.post("/notification/unread", {
    //                 checkMessage: "Get unread notification",
    //             });
    //             if (data.success) {
    //                 setList(data.data);
    //                 setUnread(data.data.length);
    //             }
    //         } catch (err) {
    //             console.error("Fetch unread noti err", err);
    //         }
    //     })();
    // }, []);


    useEffect(() => {
        if (!connected) return;

        const handler = (payload) => {
            console.log(payload);
            /* payload = { notiId, notification_title, notification_message, notification_receiver_id } */
            // thêm vào đầu
            setNotifications((prev) => [payload, ...prev]);
            // setUnread((n) => n + 1);

            // ☑️ hiển thị toast (tuỳ thư viện)
            // toast(`${payload.notification_title}`, {
            //     description: payload.notification_message,
            // });
        };

        socket.on("notification:new", handler);
        return () => socket.off("notification:new", handler);
    }, [connected, socket]);

    return (
        <NotificationContext.Provider
            value={{
                notifications
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => useContext(NotificationContext);
