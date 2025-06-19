import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from "react";
import privateAxios from "../api/privateAxios";
import { useSocket } from "./SocketContext";
import { useAuth } from "./AuthContext"; // <-- Import AuthContext của bạn vào đây

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const { socket, connected } = useSocket();
    const [unread, setUnread] = useState();
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    // Lấy trạng thái xác thực từ AuthContext
    const { isAuthenticated } = useAuth(); // <-- Giả sử AuthContext cung cấp 'isAuthenticated'

    const notificationsRef = useRef(notifications);

    useEffect(() => {
        notificationsRef.current = notifications;
        const unreadCount = notifications.filter(noti => !noti.is_read).length;
        setUnread(unreadCount);
    }, [notifications]);

    const initialFetchDone = useRef(false);

    // Hàm để tải thông báo từ backend
    const getNotifications = useCallback(async () => {
        // NGƯNG FETCH NẾU KHÔNG CÓ KẾT NỐI INTERNET HOẶC ĐANG TẢI HOẶC KHÔNG CÒN DỮ LIỆU
        if (loading || !hasMore) {
            console.log("Bỏ qua fetch: đang tải hoặc không còn thông báo.");
            return;
        }

        // NGƯNG FETCH NẾU CHƯA ĐĂNG NHẬP
        if (!isAuthenticated) {
            console.log("Bỏ qua fetch: Người dùng chưa xác thực.");
            setLoading(false); // Đảm bảo trạng thái tải được reset
            setHasMore(false); // Coi như không còn thông báo nào để tải nếu chưa xác thực
            setNotifications([]); // Xóa thông báo cũ nếu trạng thái xác thực thay đổi (logout)
            setUnread(0); // Reset số lượng chưa đọc
            return;
        }

        setLoading(true);

        let currentBeforeId = null;
        if (notificationsRef.current.length > 0) {
            currentBeforeId = notificationsRef.current[notificationsRef.current.length - 1].id;
        }

        try {
            const { data } = await privateAxios.post("/notification/getNotification", {
                beforeId: currentBeforeId,
                checkMessage: "Get notification"
            });

            if (data.success && Array.isArray(data.data)) {
                setNotifications((prev) => {
                    const existingIds = new Set(prev.map((noti) => noti.id));
                    const newUniqueNotifications = data.data.filter(
                        (newNoti) => !existingIds.has(newNoti.id)
                    );
                    return [...prev, ...newUniqueNotifications];
                });

                if (data.data.length === 0) {
                    setHasMore(false);
                } else if (data.data.length < 20) {
                    setHasMore(false);
                }

            } else {
                console.error("Lỗi khi tải thông báo: Định dạng dữ liệu không hợp lệ hoặc success false", data);
                setHasMore(false);
            }
        } catch (err) {
            console.error("Lỗi mạng hoặc phân tích cú pháp khi tải thông báo:", err);
            // Đặc biệt xử lý lỗi 401 (Unauthorized)
            if (err.response && err.response.status === 401) {
                console.warn("Không được phép tải thông báo. Người dùng cần đăng nhập.");
                setHasMore(false); // Dừng fetch nếu không được phép
            } else {
                setHasMore(false); // Dừng fetch cho các lỗi khác
            }
        } finally {
            setLoading(false);
        }
    }, [loading, hasMore, isAuthenticated]); // <-- Thêm 'isAuthenticated' vào dependency array

    // Tải thông báo ban đầu khi component mount HOẶC khi trạng thái xác thực thay đổi
    useEffect(() => {
        // Chỉ chạy khi đã xác thực VÀ chưa tải hoặc cần tải lại
        if (isAuthenticated) {
            // Nếu đây là lần đầu tiên xác thực (hoặc sau khi logout), hoặc notifications đang trống
            // thì gọi getNotifications để tải dữ liệu ban đầu
            if (initialFetchDone.current === false || notifications.length === 0) {
                initialFetchDone.current = true; // Đánh dấu đã cố gắng fetch lần đầu
                getNotifications();
            }
        } else {
            // Nếu người dùng không xác thực (hoặc logout), reset trạng thái
            setNotifications([]);
            setHasMore(true); // Reset hasMore để có thể fetch lại khi đăng nhập
            setUnread(0);
            initialFetchDone.current = false; // Reset initialFetchDone để fetch lại khi đăng nhập
        }
    }, [isAuthenticated, getNotifications, notifications.length]); // Thêm notifications.length vào dependencies

    // Socket.IO handler cho thông báo mới (không thay đổi)
    useEffect(() => {
        if (!connected || !socket) return;

        const handler = (payload) => {
            setNotifications((prev) => {
                const existingIds = new Set(prev.map((noti) => noti.id));
                if (!existingIds.has(payload.id)) {
                    return [payload, ...prev];
                }
                return prev;
            });
            setUnread(prev => prev + 1);
        };

        socket.on("notification:new", handler);
        return () => socket.off("notification:new", handler);
    }, [connected, socket]);

    // Mark a specific notification as read (không thay đổi)
    const markNotificationRead = useCallback(async (notificationId) => {
        try {
            const { data } = await privateAxios.post("/notification/markNotificatioRead", {
                notificationId: notificationId,
                checkMessage: "Mark notification read"
            });
            if (data.success) {
                setNotifications((prev) =>
                    prev.map((noti) =>
                        noti.id === notificationId
                            ? { ...noti, is_read: true }
                            : noti
                    )
                );
                setUnread(prev => Math.max(0, prev - 1));
            }
        } catch (err) {
            console.error("Mark notification as read error", err);
        }
    }, []);

    // Mark all notifications as read (không thay đổi)
    const markAllNotificationsRead = useCallback(async () => {
        try {
            const { data } = await privateAxios.post("/notification/markAllRead", {
                checkMessage: "Mark all notification read"
            });
            if (data.success) {
                setNotifications((prev) =>
                    prev.map((noti) => ({ ...noti, is_read: true }))
                );
                setUnread(0);
            }
        } catch (err) {
            console.error("Mark all notifications as read error", err);
        }
    }, []);

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unread,
                getNotifications,
                markNotificationRead,
                markAllNotificationsRead,
                loading,
                hasMore
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => useContext(NotificationContext);