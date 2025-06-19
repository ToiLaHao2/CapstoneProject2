import "./Notifications.css";
import { FaBell, FaCheckCircle, FaSpinner } from "react-icons/fa"; // Import FaSpinner
import { useNotification } from "../../context/NotifiacationContext";
import { useEffect, useCallback, useRef } from "react"; // Thêm useCallback và useRef

const Notifications = () => {
    // Lấy các state và hàm từ context đã được cải tiến
    const {
        notifications,
        getNotifications,
        markNotificationRead,
        markAllNotificationsRead,
        loading,  // Lấy trạng thái loading
        hasMore,  // Lấy trạng thái hasMore
        // unread // Bạn có thể lấy trạng thái unread nếu muốn hiển thị
    } = useNotification();

    // console.log(notifications); // Có thể bỏ dòng này nếu không cần debug nữa

    // Hàm xử lý việc đánh dấu một thông báo là đã đọc
    // Sử dụng useCallback để memoize hàm này
    const markAsRead = useCallback(async (id) => {
        await markNotificationRead(id);
    }, [markNotificationRead]); // Dependency là markNotificationRead từ context

    // Hàm xử lý việc đánh dấu tất cả thông báo là đã đọc
    // Sử dụng useCallback để memoize hàm này
    const markAllRead = useCallback(async () => {
        await markAllNotificationsRead();
    }, [markAllNotificationsRead]); // Dependency là markAllNotificationsRead từ context

    // ** OPTION 1: Infinite Scrolling (Cuộn vô hạn) **
    // Ref để theo dõi element cuối cùng trong danh sách
    const loader = useRef(null);

    useEffect(() => {
        // Observer callback: Khi phần tử loader xuất hiện trong viewport
        const handleObserver = (entries) => {
            const target = entries[0];
            if (target.isIntersecting && hasMore && !loading) {
                console.log("Loading more notifications triggered by scroll...");
                getNotifications(); // Gọi hàm để tải thêm thông báo
            }
        };

        // Tạo Intersection Observer
        const observer = new IntersectionObserver(handleObserver, {
            root: null, // theo dõi viewport
            rootMargin: "200px", // tải trước 200px khi người dùng còn cách cuối trang
            threshold: 1.0,
        });

        // Bắt đầu quan sát phần tử loader
        if (loader.current) {
            observer.observe(loader.current);
        }

        // Cleanup function: Ngừng quan sát khi component unmount
        return () => {
            if (loader.current) {
                observer.unobserve(loader.current);
            }
        };
    }, [hasMore, loading, getNotifications]); // Dependencies của useEffect


    // Hàm định dạng thời gian (có thể đặt ở một utility file riêng)
    const formatTime = (isoString) => {
        const date = new Date(isoString);
        // Tùy chỉnh định dạng theo ý muốn, ví dụ: "DD/MM/YYYY HH:mm"
        const options = {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false // 24-hour format
        };
        return new Intl.DateTimeFormat('vi-VN', options).format(date);
    };

    return (
        <div className="notifications-container">
            <div className="notifications-header">
                <h2><FaBell style={{ marginRight: "10px" }} />Notification</h2>
                {/* Nút "Đánh dấu tất cả đã đọc" */}
                {notifications.length > 0 && (
                    <button className="mark-all-read-btn" onClick={markAllRead} disabled={loading}>
                        Mark all read <FaCheckCircle />
                    </button>
                )}
            </div>

            <ul className="notifications-list">
                {notifications.length === 0 && !loading && !hasMore ? ( // Hiển thị khi không có thông báo và đã tải xong
                    <p className="no-notifications">Bạn đã xem hết thông báo rồi! 🎉</p>
                ) : (
                    notifications.map(notification => (
                        <li
                            key={notification.id}
                            className={`notification-item ${notification.is_read ? 'read' : ''}`}
                        >
                            <div className="notification-content">
                                <p className="notification-title">{notification.notification_title}</p>
                                <p className="notification-message">{notification.notification_message}</p>
                            </div>
                            <div className="notification-actions">
                                {/* Định dạng thời gian tạo */}
                                <small className="notification-time">{formatTime(notification.created_at)}</small>
                                {/* Chỉ hiển thị nút "Đã đọc" nếu chưa đọc */}
                                {!notification.is_read && (
                                    <FaCheckCircle
                                        className="mark-read"
                                        onClick={() => markAsRead(notification.id)}
                                        title="Đánh dấu đã đọc"
                                    />
                                )}
                            </div>
                        </li>
                    ))
                )}
                {/* Hiển thị spinner khi đang tải thêm */}
                {loading && (
                    <li className="loading-indicator">
                        <FaSpinner className="spinner" /> Đang tải...
                    </li>
                )}
                {/* Hiển thị thông báo khi hết dữ liệu và không còn loading */}
                {!hasMore && !loading && notifications.length > 0 && (
                    <li className="no-more-notifications">
                        You have viewed all notifications.</li>
                )}
            </ul>

            {/* Phần tử dùng để kích hoạt "load more" khi cuộn */}
            {/* Chỉ hiển thị nếu còn có thể tải thêm */}
            {hasMore && !loading && (
                <div ref={loader} style={{ height: "20px", margin: "10px 0" }}></div>
            )}

            {/* ** OPTION 2: "Load More" Button (Nếu không dùng cuộn vô hạn) **
            {hasMore && !loading && notifications.length > 0 && (
                <button onClick={getNotifications} className="load-more-btn">
                    Tải thêm thông báo
                </button>
            )}
            {loading && notifications.length > 0 && (
                <button disabled className="load-more-btn">
                    <FaSpinner className="spinner" /> Đang tải...
                </button>
            )}
            */}
        </div>
    );
};

export default Notifications;