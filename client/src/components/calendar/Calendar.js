import React, { useState, useRef } from 'react';
import CalendarComponent from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './Calendar.css';
import "../general/MainContentContainer.css";

// Fake data
const events = {
  '2024-12-28': [
    { time: '09:00 - 09:30', event: 'Call meeting Peer <> Leslie' },
    { time: '15:20 - 16:20', event: 'Livn Product Demo' },
  ],
  '2024-12-29': [
    { time: '11:15 - 11:45', event: 'Call meeting Olivia, Liam <> Alban' },
  ],
  '2024-12-02': [
    { time: '11:15 - 11:45', event: 'Call meeting Olivia, Liam <> Alban' },
  ],
  '2024-12-04': [
    { time: '10:00 - 11:00', event: 'Team Standup' },
    { time: '14:00 - 15:30', event: 'Project Kickoff' },
  ],
  '2024-12-07': [
    { time: '09:00 - 10:00', event: 'Sprint Planning' },
    { time: '16:00 - 17:00', event: '1-on-1 with Manager' },
  ],
};

const Calendar = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState([]);
  const dayRefs = useRef({});

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
    return events[formattedDate] !== undefined;
  };

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
                    {events[formattedDate] ? (
                      events[formattedDate].map((e, idx) => (
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