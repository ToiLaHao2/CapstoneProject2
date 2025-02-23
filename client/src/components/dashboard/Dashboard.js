import React, { useState } from 'react';
import './Dashboard.css';
import CalendarComponent from 'react-calendar';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const today = new Date();
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState(today);

    const tasks = [
        {
            date: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
            details: {
                project: 'Daily Standup Meeting',
                task: 'Attend Scrum meeting',
                deadline: today.toLocaleDateString(),
                timeLeft: '0 days, 3 hours',
            },
        },
        {
            date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2),
            details: {
                project: 'Website Design',
                task: 'Submit wireframe designs',
                deadline: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2).toLocaleDateString(),
                timeLeft: '2 days, 5 hours',
            },
        },
    ];

    // Lấy task dựa trên ngày chọn
    const selectedTask = tasks.find(task =>
        task.date.toDateString() === selectedDate.toDateString()
    );

    const handleDateChange = (date) => {
        setSelectedDate(date);
    };

    return (
        <div className="dashboard-container">
            {/* My Task Section */}
            <div className="tasks">
                <div className="my-tasks" onClick={() => navigate('/my-tasks')}>
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
                    <h3>Progress Chart</h3>
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

            {/*  dashboard Section */}
            <div className="recently-dashboard">
                <div className="dashboard-project">
                    <p>Website Design</p>
                    <span>Design Project</span>
                </div>
                <div className="dashboard-project">
                    <p>SEO Project 2024</p>
                    <span>Business Project</span>
                </div>
                <div className="dashboard-project">
                    <p>Plan in 2024</p>
                    <span>Personal Project</span>
                </div>
            </div>

            <div className="calendar-container">
                {/* Calendar Section */}
                {/* <div className="calendar-section">
                    <h3>Calendar</h3>
                    <CalendarComponent
                        onChange={handleDateChange}
                        value={selectedDate}
                    />
                </div> */}

                <div className="calendar-section">
                    <h3 className="calendar-title">Calendar</h3>
                    <CalendarComponent
                        onChange={handleDateChange}
                        value={selectedDate}
                        tileContent={({ date, view }) =>
                            view === "month" &&
                                tasks.some(task =>
                                    task.date.toDateString() === date.toDateString()
                                ) ? (
                                <div className="highlight-task"></div>
                            ) : null
                        }
                    />
                </div>


                {/* Details Calendar Section */}
                <div className="details-calendar-section">
                    <div className="task-details">
                        <h4>Task Details</h4>
                        {selectedTask ? (
                            <>
                                <p><strong>Project:</strong> {selectedTask.details.project}</p>
                                <p><strong>Task:</strong> {selectedTask.details.task}</p>
                                <p><strong>Deadline:</strong> {selectedTask.details.deadline}</p>
                                <p><strong>Time Left:</strong> {selectedTask.details.timeLeft}</p>
                            </>
                        ) : (
                            <p>No task for this date.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
