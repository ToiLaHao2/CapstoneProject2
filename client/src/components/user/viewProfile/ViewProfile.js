import React, { useEffect, useRef, useState } from "react";
import "./ViewProfile.css";
import { useUser } from "../../../context/UserContext";
import { useNavigate } from "react-router-dom";
import { useBoard } from "../../../context/BoardContext";
import { FaEdit } from "react-icons/fa";
import moment from "moment";

import Notifications from "../../notifications/Notifications";

const ViewProfile = () => {
    const [activeTab, setActiveTab] = useState("Activity");
    const [showAllProjects, setShowAllProjects] = useState(false);

    const [showEditProfileOverlay, setShowEditProfileOverlay] = useState(false);
    const [newFullName, setNewFullName] = useState("");
    const [editMessage, setEditMessage] = useState(""); // Để hiển thị thông báo lỗi/thành công


    const { boards, getAllBoardsByUserId, getBoardTitleById } = useBoard();
    const { user, uploadAvatar, colorHashMap, getUserCardsIncoming, updateUserProfile } = useUser();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [scheduledEvents, setScheduledEvents] = useState([]);

    useEffect(() => {
        getAllBoardsByUserId();
    }, [getAllBoardsByUserId]);

    // Effect để fetch và xử lý dữ liệu cho tab "Schedule"
    useEffect(() => {
        const fetchScheduleData = async () => {
            if (user && user._id) {
                try {
                    const cards = await getUserCardsIncoming(user._id);

                    // Lọc và sắp xếp các card có due_date trong tương lai
                    const upcomingCards = cards
                        .filter(card => moment(card.due_date).isAfter(moment()))
                        .sort((a, b) => moment(a.due_date).diff(moment(b.due_date))); // Sắp xếp theo ngày tăng dần

                    const formattedEvents = upcomingCards.map(card => {
                        const boardTitle = getBoardTitleById(card.board_id);
                        return {
                            id: card._id,
                            title: card.card_title,
                            dueDate: card.due_date,
                            boardTitle: boardTitle,
                        };
                    });
                    setScheduledEvents(formattedEvents);
                } catch (error) {
                    console.error("Failed to fetch schedule data:", error);
                }
            }
        };

        // Chỉ fetch dữ liệu khi tab là "Schedule" hoặc khi user/context thay đổi
        // Điều này giúp tránh fetch lại không cần thiết
        if (activeTab === "Schedule" && user && getBoardTitleById && getUserCardsIncoming) {
            fetchScheduleData();
        }
    }, [activeTab, user, getUserCardsIncoming, getBoardTitleById]);

    // Cập nhật giá trị newFullName khi user data thay đổi hoặc overlay được mở
    useEffect(() => {
        if (user && showEditProfileOverlay) {
            setNewFullName(user.user_full_name);
        }
    }, [user, showEditProfileOverlay]);


    const handleProjectClick = (boardTitle, board_id) => {
        navigate("/Tasks", { state: { boardTitle, board_id } });
    };

    const renderContent = () => {
        switch (activeTab) {
            case "Activity":
                // return (
                //     <div className="content">
                //         <h4>9:00 AM, Apr 8 2022</h4>
                //         <p>Checked in to Little Tigers Karate class</p>
                //         <h4>4:50 PM, Mar 30 2022</h4>
                //         <p>
                //             Payment of $99.00 made towards Little Tigers Karate
                //             program
                //         </p>
                //     </div>
                // );
                return (
                    <div className="content">
                        {/* Truyền prop hideHeader để ẩn header của Notifications */}
                        <Notifications hideHeader={true} />
                    </div>
                );
            case "Schedule":
                return (
                    <div className="content">
                        {scheduledEvents.length > 0 ? (
                            <ul className="schedule-list">
                                {scheduledEvents.map((event) => (
                                    <li key={event.id} className="schedule-item">
                                        <p>
                                            <span className="schedule-date">
                                                {moment(event.dueDate).format("MMM Do, YYYY")}
                                            </span>{" "}
                                            at{" "}
                                            <span className="schedule-time">
                                                {moment(event.dueDate).format("hh:mm A")}
                                            </span>
                                        </p>
                                        <p className="schedule-details">
                                            <strong><i>[PROJECT: {event.boardTitle}]</i></strong>______{event.title}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No upcoming tasks.</p>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            // Xử lý file (ví dụ: gửi lên server)
            console.log("File được chọn:", file);
            // Thêm logic gửi file lên server tại đây
            const formData = new FormData();
            formData.append("avatar", file);
            formData.append("checkMessage", "Upload avatar");
            await uploadAvatar(formData);
        }
    };

    // Hàm xử lý khi click "Edit Profile" button
    const handleEditProfileClick = () => {
        setShowEditProfileOverlay(true);
        setEditMessage(""); // Reset message
    };

    // Hàm xử lý submit form
    const handleUpdateFullName = async (e) => {
        e.preventDefault();
        setEditMessage("Updating...");
        const result = await updateUserProfile({ user_full_name: newFullName });

        if (result.success) {
            setEditMessage("Profile updated successfully!");
            setTimeout(() => {
                setShowEditProfileOverlay(false); // Đóng overlay sau 1.5s
            }, 1500);
        } else {
            setEditMessage(`Error: ${result.message}`);
        }
    };

    return (
        <div className="profile-container">
            {/* Header Section */}
            <div className="profile-header">
                <div className="profile-info">
                    {user.user_avatar_url !== "empty" ? (
                        <img
                            className="small-avatar"
                            src={user.user_avatar_url}
                            alt="small-avatar"
                        />
                    ) : (
                        <div
                            className="small-no-avatar"
                            style={{
                                backgroundColor: `${colorHashMap[
                                    user.user_full_name
                                        .charAt(0)
                                        .toUpperCase()
                                ]
                                    }`,
                                color: "white",
                            }}
                        >
                            {user.user_full_name.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div
                        className="avatar-edit-icon"
                        onClick={handleAvatarClick}
                    >
                        <FaEdit />
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: "none" }}
                        onChange={handleFileChange}
                    />

                    <div>
                        <h2>{user.user_full_name}</h2>
                        <p className="status active">Active</p>
                    </div>
                </div>
                <div className="contact-info">
                    <div className="contact-item">📧 {user.user_email}</div>

                    <button className="edit-profile-btn" onClick={handleEditProfileClick}>Edit Profile</button>
                    <button
                        className="change-password-btn"
                        onClick={() => {
                            navigate("/change-password");
                        }}
                    >
                        Change Password
                    </button>
                </div>
            </div>

            {/* Projects Section */}
            {/* <div className="projects-section">
                <h3>Projects</h3>
                <div className="projects">
                    {projects.slice(0, showAllProjects ? projects.length : 2).map((project, index) => (
                        <div key={index} className={`project-card ${project.status}`}>
                            <h4>{project.name}</h4>
                            <p>Upcoming: {project.time}</p>
                        </div>
                    ))}
                </div>
                <button className="view-more-btn" onClick={() => setShowAllProjects(!showAllProjects)}>
                    {showAllProjects ? "View Less" : "View More"}
                </button>
            </div> */}
            <div className="projects-section">
                <h3>Projects</h3>
                <div className="projects">
                    {boards.length > 0 ? (
                        boards
                            .slice(0, showAllProjects ? boards.length : 2)
                            .map((project, index) => (
                                <div
                                    key={index}
                                    className="project-card active"
                                    onClick={() =>
                                        handleProjectClick(
                                            project.board_title,
                                            project._id
                                        )
                                    }
                                >
                                    <h4>{project.board_title}</h4>
                                    <p>
                                        {project.board_description ||
                                            "No description"}
                                    </p>
                                </div>
                            ))
                    ) : (
                        <p>No projects available</p>
                    )}
                </div>
                {boards.length > 2 && (
                    <button
                        className="view-more-btn"
                        onClick={() => setShowAllProjects(!showAllProjects)}
                    >
                        {showAllProjects ? "View Less" : "View More"}
                    </button>
                )}
            </div>

            {/* Tabs Section */}
            <div className="tabs">
                <div
                    className={`tab ${activeTab === "Activity" ? "active" : ""
                        }`}
                    onClick={() => setActiveTab("Activity")}
                >
                    Activity
                </div>
                <div
                    className={`tab ${activeTab === "Schedule" ? "active" : ""
                        }`}
                    onClick={() => setActiveTab("Schedule")}
                >
                    Schedule
                </div>

            </div>

            {/* Nội dung của tab */}
            {renderContent()}

            {/* Edit Profile Overlay */}
            {showEditProfileOverlay && (
                <div className="overlay">
                    <div className="overlay-content">
                        <h3>Edit Profile</h3>
                        <form onSubmit={handleUpdateFullName}>
                            <div className="form-group">
                                <label htmlFor="fullName">Full Name:</label>
                                <input
                                    type="text"
                                    id="fullName"
                                    value={newFullName}
                                    onChange={(e) => setNewFullName(e.target.value)}
                                    required
                                />
                            </div>
                            {editMessage && <p className="edit-message">{editMessage}</p>}
                            <div className="form-actions">
                                <button type="submit" className="save-btn">Save</button>
                                <button type="button" className="cancel-btn" onClick={() => setShowEditProfileOverlay(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ViewProfile;
