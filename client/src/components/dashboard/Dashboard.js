import React, { useState } from 'react';
import './Dashboard.css';
import CalendarComponent from 'react-calendar'; 
const Dashboard = () => {
    const [selectedDate, setSelectedDate] = useState(null);

    const taskDetails = {
        project: 'Website Design',
        task: 'Create Homepage Layout',
        deadline: '2024-11-30',
        timeLeft: '5 days, 2 hours, 30 minutes',
    };

    const handleDateChange = (date) => {
        setSelectedDate(date);
    };

    return (
        <div className="dashboard-container">
            {/* My Task Section */}
            <div className="tasks">
                <div className="my-tasks">
                    <h3>My Task</h3>
                    <div className="task priority-task">
                        <h4>Priority Task</h4>
                        <p>23/34 Task</p>
                    </div>
                    <div className="task upcoming-task">
                        <h4>Upcoming Task</h4>
                        <p>3/34 Task</p>
                    </div>
                    <div className="task overdue-task">
                        <h4>Overdue Task</h4>
                        <p>10/34 Task</p>
                    </div>
                    <div className="task pending-task">
                        <h4>Pending Task</h4>
                        <p>2/34 Task</p>
                    </div>
                </div>

                {/* Urgently Task Section */}
                <div className="urgently-task">
                    <h3>Urgently Task</h3>
                    <div className="progress">
                        <h4>Project 1</h4>
                        <progress value="70" max="100"></progress>
                    </div>
                    <div className="progress">
                        <h4>Project 2</h4>
                        <progress value="50" max="100"></progress>
                    </div>
                    <div className="progress">
                        <h4>Project 3</h4>
                        <progress value="30" max="100"></progress>
                    </div>
                    <div className="progress">
                        <h4>Project 4</h4>
                        <progress value="10" max="100"></progress>
                    </div>
                </div>
            </div>

            {/* Recently Visited Section */}
            <div className="recently-visited">
                <div className="visited-project">
                    <p>Website Design</p>
                    <span>Design Project</span>
                </div>
                <div className="visited-project">
                    <p>SEO Project 2024</p>
                    <span>Business Project</span>
                </div>
                <div className="visited-project">
                    <p>Plan in 2024</p>
                    <span>Personal Project</span>
                </div>
            </div>

            <div className="calendar-container">
                {/* Calendar Section */}
                <div className="calendar-section">
                <h3>Calendar</h3>
                    <CalendarComponent
                        onChange={handleDateChange}
                        value={selectedDate}
                    />
                </div>

                {/* Details Calendar Section */}
                <div className="details-calendar-section">
                    {selectedDate && (
                        <div className="task-details">
                            <h4>Task Details for {selectedDate.toLocaleDateString()}</h4>
                            <p><strong>Project:</strong> {taskDetails.project}</p>
                            <p><strong>Task:</strong> {taskDetails.task}</p>
                            <p><strong>Deadline:</strong> {taskDetails.deadline}</p>
                            <p><strong>Time Left:</strong> {taskDetails.timeLeft}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
