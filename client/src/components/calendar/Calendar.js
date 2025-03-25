import React, { useState, useRef, useEffect } from 'react';
import CalendarComponent from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './Calendar.css';
import "../general/MainContentContainer.css";
import { useUser } from '../../context/UserContext';

const Calendar = () => {
    const { user, getUserCardsIncoming } = useUser(); 
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedWeek, setSelectedWeek] = useState([]);
    const dayRefs = useRef({});
    const [userEvents, setUserEvents] = useState({}); 
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState(null);

    useEffect(() => {
        if (user && user._id) {
          console.log("User ID:", user._id); 
            setLoading(true);
            setError(null);
            getUserCardsIncoming(user._id)
            
                .then(cards => {
                  console.log("Cards from API:", cards);
                    const formattedEvents = {};
                    cards.forEach(card => {
                        if (card.card_duration) { // Check if card_duration exists
                            const dueDate = new Date(card.card_duration).toISOString().split('T')[0];
                            if (!formattedEvents[dueDate]) {
                                formattedEvents[dueDate] = [];
                            }
                            formattedEvents[dueDate].push({
                                time: card.created_at ? `${new Date(card.created_at).toLocaleTimeString()} - ${new Date(card.card_duration).toLocaleTimeString()}` : 'Due',
                                event: card.card_title,
                            });
                        }
                    });
                    setUserEvents(formattedEvents);
                    console.log("userEvents after fetch:", userEvents); 

                })
                .catch(err => {
                    setError(err);
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [user, getUserCardsIncoming]);

    // Lấy danh sách ngày trong tuần
    const getWeekDays = (date) => {
        const startOfWeek = new Date(date);
        const dayOfWeek = startOfWeek.getDay(); // Lấy thứ của ngày hiện tại (0: Chủ Nhật, 1: Thứ Hai, ...)
        const offset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Điều chỉnh để bắt đầu từ Thứ Hai
        startOfWeek.setDate(startOfWeek.getDate() + offset); // Chuyển đến Thứ Hai đầu tuần

        const days = [];
        for (let i = 0; i < 7; i++) {
            const day = new Date(startOfWeek);
            day.setDate(startOfWeek.getDate() + i);
            days.push(day);
        }
        return days;
    };

    // Xử lý khi chọn ngày
    const handleDateClick = (date) => {
        setSelectedDate(date);
        const weekDays = getWeekDays(date);
        setSelectedWeek(weekDays);

        // Cuộn tới ngày trong danh sách
        const formattedDate = date.toISOString().split('T')[0];
        if (dayRefs.current[formattedDate]) {
            dayRefs.current[formattedDate].scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }
    };

    // Kiểm tra ngày có sự kiện
    const isDayWithEvent = (date) => {
        const formattedDate = date.toISOString().split('T')[0];
        return userEvents[formattedDate] !== undefined;
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>Error: {error.message}</p>;
    }

    return (
        <div className="calendar-container">
            <div className="calendar-left">
                <CalendarComponent
                    onClickDay={handleDateClick}
                    tileContent={({ date }) =>
                        isDayWithEvent(date) ? <div className="event-dot"></div> : null
                    }
                />
            </div>

            {/* Danh sách sự kiện*/}
            <div className="calendar-right">
                {selectedWeek.length > 0 ? (
                    <div className="week-details">
                        <h2>Events for the week:</h2>
                        {selectedWeek.map((day, index) => {
                            const formattedDate = day.toISOString().split('T')[0];
                            const isActive = selectedDate && day.toDateString() === selectedDate.toDateString();

                            return (
                                <div
                                    key={index}
                                    ref={(el) => (dayRefs.current[formattedDate] = el)}
                                    className={`day-details ${isActive ? 'active-day' : ''}`}
                                    onClick={() => setSelectedDate(day)}
                                >
                                    <h3>{day.toDateString()}</h3>
                                    <ul>
                                        {userEvents[formattedDate] ? (
                                            userEvents[formattedDate].map((e, idx) => (
                                                <li key={idx}>{e.time}: {e.event}</li>
                                            ))
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
    );
};

export default Calendar;