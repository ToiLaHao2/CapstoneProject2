import React, { useEffect, useState } from "react";
import "./Dashboard.css";
import CalendarComponent from "react-calendar";
import { useNavigate } from "react-router-dom";
import { useBoard } from "../../context/BoardContext";
import { useUser } from "../../context/UserContext";
import moment from "moment";

const Dashboard = () => {
    const today = moment().toDate();
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState(today);
    const { boards, getAllBoardsByUserId } = useBoard();
    const { user, getUserCardsIncoming } = useUser();
    const [cards, setCards] = useState([]);
    const [tasks, setTasks] = useState([]);

    const handleProjectClick = (boardTitle, board_id) => {
        navigate("/Tasks", { state: { boardTitle, board_id } });
    };

    useEffect(() => {
        getAllBoardsByUserId();
    }, []);

    const latestBoards = [...boards]
        .filter((board) => board.created_at)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 3);

    useEffect(() => {
        if (user && user._id) {
            getUserCardsIncoming(user._id)
                .then((cards) => {
                    setCards(cards);
                    const newTasks = cards.map((card) => {
                        const deadline = moment(card.due_date);

                        return {
                            date: deadline.toDate(),
                            details: {
                                project: card.card_title,
                                task: card.card_description,
                                deadline: deadline.format("DD/MM/YYYY"),
                                timeLeft: countTimeLeft(deadline),
                            },
                        };
                    });
                    setTasks(newTasks);
                })
                .catch((error) => {
                    console.error("Failed to fetch user cards:", error);
                });
        }
    }, [user]);

    const countTimeLeft = (deadlineMoment) => {
        const now = moment();
        const diff = moment.duration(deadlineMoment.diff(now));

        const days = Math.floor(diff.asDays());
        const hours = diff.hours();

        return `${days} day(s), ${hours} hour(s)`;
    };

    const selectedTask = tasks.find(
        (task) =>
            moment(task.date).format("YYYY-MM-DD") ===
            moment(selectedDate).format("YYYY-MM-DD")
    );

    const handleDateChange = (date) => {
        setSelectedDate(date);
    };

    return (
        <div className="dashboard-container">
            <div className="tasks">
                <div className="my-tasks" onClick={() => navigate("/my-tasks")}>
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

            <div className="recently-dashboard">
                {latestBoards.length > 0 ? (
                    latestBoards.map((board) => (
                        <div
                            key={board._id}
                            className="dashboard-project"
                            onClick={() =>
                                handleProjectClick(board.board_title, board._id)
                            }
                            style={{ cursor: "pointer" }}
                        >
                            <p>{board.board_title}</p>
                            <span>{board.board_description}</span>
                        </div>
                    ))
                ) : (
                    <p>No recent boards available.</p>
                )}
            </div>

            <div className="calendar-container">
                <div className="calendar-section">
                    <h3 className="calendar-title">Calendar</h3>
                    <CalendarComponent
                        onChange={handleDateChange}
                        value={selectedDate}
                        tileContent={({ date, view }) =>
                            view === "month" &&
                            tasks.some(
                                (task) =>
                                    moment(task.date).format("YYYY-MM-DD") ===
                                    moment(date).format("YYYY-MM-DD")
                            ) ? (
                                <div className="highlight-task"></div>
                            ) : null
                        }
                    />
                </div>

                <div className="details-calendar-section">
                    <div className="task-details">
                        <h4>Task Details</h4>
                        {selectedTask ? (
                            <>
                                <p>
                                    <strong>Project:</strong>{" "}
                                    {selectedTask.details.project}
                                </p>
                                <p>
                                    <strong>Task:</strong>{" "}
                                    {selectedTask.details.task}
                                </p>
                                <p>
                                    <strong>Deadline:</strong>{" "}
                                    {selectedTask.details.deadline}
                                </p>
                                <p>
                                    <strong>Time Left:</strong>{" "}
                                    {selectedTask.details.timeLeft}
                                </p>
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
