import React from 'react';
import CalendarComponent from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './Calendar.css';
import "../general/MainContentContainer.css"

const Calendar = () => {
  return (
    <div className="calendar">
      <h1>Calendar</h1>
      <CalendarComponent />
    </div>
  );
};

export default Calendar;
