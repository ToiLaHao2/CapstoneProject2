import React, { useEffect, useRef, useState } from "react";
import "./ViewProfile.css";
import { useUser } from "../../../context/UserContext";
import { useNavigate } from "react-router-dom";
import { useBoard } from "../../../context/BoardContext";
import { FaEdit } from "react-icons/fa";

const ViewProfile = () => {
    const [activeTab, setActiveTab] = useState("Activity");
    const [showAllProjects, setShowAllProjects] = useState(false);
    const { boards, getAllBoardsByUserId } = useBoard();
    const { user, uploadAvatar } = useUser();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    useEffect(() => {
        getAllBoardsByUserId();
    }, []);

    const handleProjectClick = (boardTitle, board_id) => {
        navigate("/Tasks", { state: { boardTitle, board_id } });
    };

    const renderContent = () => {
        switch (activeTab) {
            case "Activity":
                return (
                    <div className="content">
                        <h4>9:00 AM, Apr 8 2022</h4>
                        <p>Checked in to Little Tigers Karate class</p>
                        <h4>4:50 PM, Mar 30 2022</h4>
                        <p>
                            Payment of $99.00 made towards Little Tigers Karate
                            program
                        </p>
                    </div>
                );
            case "Schedule":
                return (
                    <div className="content">
                        <h4>Upcoming Classes</h4>
                        <p>Monday, 4:00 PM - Little Tigers Karate</p>
                        <p>Wednesday, 5:00 PM - Swimming Dolphin</p>
                    </div>
                );
            case "Teams":
                return (
                    <div className="content">
                        <h4>Team Members</h4>
                        <p>Andrew Coleman</p>
                        <p>Emily Johnson</p>
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
            formData.append("file", file);
            formData.append("checkMessage", "Upload avatar");
            await uploadAvatar(formData);
        }
    };

    return (
        <div className="profile-container">
            {/* Header Section */}
            <div className="profile-header">
                <div className="profile-info">
                    <div className="avatar">
                        {user.user_avatar_url !== "empty" ? (
                            <img
                                className="small-avatar"
                                src={user.user_avatar_url}
                                alt="small-avatar"
                            />
                        ) : (
                            user.user_full_name.charAt(0).toUpperCase()
                        )}
                    </div>

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
                        {/* <p>Age 6 • Student • Melbourne, Australia</p> */}
                    </div>
                </div>
                <div className="contact-info">
                    <div className="contact-item">📧 {user.user_email}</div>
                    {/* <div className="contact-item">📞 +1 0987654321</div> */}

                    <button className="edit-profile-btn">Edit Profile</button>
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
                    className={`tab ${
                        activeTab === "Activity" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("Activity")}
                >
                    Activity
                </div>
                <div
                    className={`tab ${
                        activeTab === "Schedule" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("Schedule")}
                >
                    Schedule
                </div>
                <div
                    className={`tab ${activeTab === "Teams" ? "active" : ""}`}
                    onClick={() => setActiveTab("Teams")}
                >
                    Teams
                </div>
            </div>

            {/* Nội dung của tab */}
            {renderContent()}
        </div>
    );
};

export default ViewProfile;
