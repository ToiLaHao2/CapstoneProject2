import React, { useState, useRef, useEffect } from "react";
import CalendarComponent from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./Calendar.css";
import "../general/MainContentContainer.css";
import { useUser } from "../../context/UserContext";
import { useBoard } from "../../context/BoardContext";
import moment from "moment";
import { useNavigate } from "react-router-dom";

const Calendar = () => {
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedWeek, setSelectedWeek] = useState([]);
    const dayRefs = useRef({});

    const { user, getUserCardsIncoming } = useUser();
    const { getBoardTitleById } = useBoard();
    const [events, setEvents] = useState({});

    useEffect(() => {
        if (user && user._id) {
            getUserCardsIncoming(user._id)
                .then((cards) => {
                    const groupedEvents = {};

                    cards.forEach((card) => {
                        const boardTitle = getBoardTitleById(card.board_id);
                        const dateKey = moment(card.due_date).format(
                            "YYYY-MM-DD"
                        );

                        if (!groupedEvents[dateKey]) {
                            groupedEvents[dateKey] = [];
                        }

                        groupedEvents[dateKey].push({
                            time: card.created_at
                                ? `${moment(card.created_at).format(
                                    "HH:mm"
                                )} - ${moment(card.due_date).format("HH:mm")}`
                                : "Due",
                            event: card.card_title,
                            board_title: boardTitle, // Gán boardTitle đã lấy được từ context

                        });
                    });

                    setEvents(groupedEvents);
                })
                .catch((error) => {
                    console.error("Failed to fetch user cards:", error);
                });
        }
    }, [user, getUserCardsIncoming, getBoardTitleById]);

    const getWeekDays = (date) => {
        const startOfWeek = moment(date).startOf("isoWeek");
        const days = [];
        for (let i = 0; i < 7; i++) {
            days.push(moment(startOfWeek).add(i, "days"));
        }
        return days;
    };

    const handleDateClick = (date) => {
        const selected = moment(date);
        setSelectedDate(selected);
        const weekDays = getWeekDays(selected);
        setSelectedWeek(weekDays);

        const formattedDate = selected.format("YYYY-MM-DD");
        if (dayRefs.current[formattedDate]) {
            dayRefs.current[formattedDate].scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }
    };

    const isDayWithEvent = (date) => {
        const formattedDate = moment(date).format("YYYY-MM-DD");
        return !!events[formattedDate];
    };

    return (
        <div className="calendar">
            <h1>Calendar</h1>
            <div className="calendar-container">
                <div className="calendar-left">
                    <CalendarComponent
                        onClickDay={handleDateClick}
                        tileContent={({ date }) =>
                            isDayWithEvent(date) ? (
                                <div className="event-dot"></div>
                            ) : null
                        }
                    />
                </div>

                <div className="calendar-right">
                    {selectedWeek.length > 0 ? (
                        <div className="week-details">
                            <h2>Events for the week:</h2>
                            {selectedWeek.map((day, index) => {
                                const formattedDate = day.format("YYYY-MM-DD");
                                const isActive =
                                    selectedDate &&
                                    day.format("YYYY-MM-DD") ===
                                    selectedDate.format("YYYY-MM-DD");

                                return (
                                    <div
                                        key={index}
                                        ref={(el) =>
                                        (dayRefs.current[formattedDate] =
                                            el)
                                        }
                                        className={`day-details ${isActive ? "active-day" : ""
                                            }`}
                                        onClick={() => setSelectedDate(day)}
                                    >
                                        <h3>
                                            {day.format("dddd, MMMM Do YYYY")}
                                        </h3>
                                        <ul>
                                            {/* {events[formattedDate] ? (
                                                events[formattedDate].map(
                                                    (e, idx) => (
                                                        <li key={idx}>
                                                            {e.time}: {e.event}
                                                        </li>
                                                    )
                                                )
                                            ) : (
                                                <li>No events</li>
                                            )} */}

                                             {events[formattedDate] ? (
                                                events[formattedDate].map(
                                                    (e, idx) => (
                                                        <li key={idx}>
                                                            {e.time}:{" "}
                                                            {e.board_title && (
                                                                <strong><i>[PROJECT: {e.board_title}]</i></strong>
                                                            )}{"______"}
                                                            {e.event}
                                                        </li>
                                                    )
                                                )
                                            ) : (
                                                <li>No events</li>
                                            )}


                                        </ul>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p>Select a date to view the week's events.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Calendar;
