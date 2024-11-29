import React, { useState } from "react";
import "./ViewProfile.css";

const ViewProfile = () => {
  const [activeTab, setActiveTab] = useState("Activity");

  const renderContent = () => {
    switch (activeTab) {
      case "Activity":
        return (
          <div className="content">
            <h4>9:00 AM, Apr 8 2022</h4>
            <p>Checked in to Little Tigers Karate class</p>
            <h4>4:50 PM, Mar 30 2022</h4>
            <p>Payment of $99.00 made towards Little Tigers Karate program</p>
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

  return (
    <div className="profile-container">
      {/* Header Section */}
      <div className="profile-header">
        <div className="profile-info">
          <div className="avatar">C</div>
          <div>
            <h2>Charlotte Bell</h2>
            <p className="status active">Active</p>
            <p>Age 6 • Student • Melbourne, Australia</p>
          </div>
        </div>
        <div className="contact-info">
          <div className="contact-item">📧 charlottebell@gmail.com</div>
          <div className="contact-item">📞 +1 0987654321</div>

          <button className="edit-profile-btn">Edit Profile</button>
          <button className="change-password-btn">Change Password</button>
        </div>
      </div>

      {/* Projects Section */}
      <div className="projects-section">
        <h3>Projects</h3>
        <div className="projects">
          <div className="project-card active">
            <h4>Little Tigers Karate</h4>
            <p>Upcoming: Monday, 4:00 PM - 5:00 PM</p>
          </div>
          <div className="project-card cancelled">
            <h4>Swimming Dolphin</h4>
            <p>Upcoming: Monday, 4:00 PM - 5:00 PM</p>
          </div>
        </div>
        <button className="view-more-btn">View More</button>
      </div>

      {/* Tabs Section */}
      <div className="tabs">
        <div
          className={`tab ${activeTab === "Activity" ? "active" : ""}`}
          onClick={() => setActiveTab("Activity")}
        >
          Activity
        </div>
        <div
          className={`tab ${activeTab === "Schedule" ? "active" : ""}`}
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
