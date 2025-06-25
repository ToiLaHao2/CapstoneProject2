// import React, { useState, useRef, useEffect } from "react";
// import CalendarComponent from "react-calendar";
// import "react-calendar/dist/Calendar.css";
// import "./Calendar.css";
// import "../general/MainContentContainer.css";
// import { useUser } from "../../context/UserContext";
// import { useBoard } from "../../context/BoardContext";
// import moment from "moment";
// import { useNavigate } from "react-router-dom";

// const Calendar = () => {
//     const [selectedDate, setSelectedDate] = useState(null);
//     const [selectedWeek, setSelectedWeek] = useState([]);
//     const dayRefs = useRef({});

//     const { user, getUserCardsIncoming } = useUser();
//     const { getBoardTitleById } = useBoard();
//     const [events, setEvents] = useState({});

//     useEffect(() => {
//         if (user && user._id) {
//             getUserCardsIncoming(user._id)
//                 .then((cards) => {
//                     const groupedEvents = {};

//                     cards.forEach((card) => {
//                         const boardTitle = getBoardTitleById(card.board_id);
//                         const dateKey = moment(card.due_date).format(
//                             "YYYY-MM-DD"
//                         );

//                         if (!groupedEvents[dateKey]) {
//                             groupedEvents[dateKey] = [];
//                         }

//                         groupedEvents[dateKey].push({
//                             time: card.created_at
//                                 ? `${moment(card.created_at).format(
//                                     "HH:mm"
//                                 )} - ${moment(card.due_date).format("HH:mm")}`
//                                 : "Due",
//                             event: card.card_title,
//                             board_title: boardTitle, // Gán boardTitle đã lấy được từ context

//                         });
//                     });

//                     setEvents(groupedEvents);
//                 })
//                 .catch((error) => {
//                     console.error("Failed to fetch user cards:", error);
//                 });
//         }
//     }, [user, getUserCardsIncoming, getBoardTitleById]);

//     const getWeekDays = (date) => {
//         const startOfWeek = moment(date).startOf("isoWeek");
//         const days = [];
//         for (let i = 0; i < 7; i++) {
//             days.push(moment(startOfWeek).add(i, "days"));
//         }
//         return days;
//     };

//     const handleDateClick = (date) => {
//         const selected = moment(date);
//         setSelectedDate(selected);
//         const weekDays = getWeekDays(selected);
//         setSelectedWeek(weekDays);

//         const formattedDate = selected.format("YYYY-MM-DD");
//         if (dayRefs.current[formattedDate]) {
//             dayRefs.current[formattedDate].scrollIntoView({
//                 behavior: "smooth",
//                 block: "start",
//             });
//         }
//     };

//     const isDayWithEvent = (date) => {
//         const formattedDate = moment(date).format("YYYY-MM-DD");
//         return !!events[formattedDate];
//     };

//     return (
//         <div className="calendar">
//             <h1>Calendar</h1>
//             <div className="calendar-container">
//                 <div className="calendar-left">
//                     <CalendarComponent
//                         onClickDay={handleDateClick}
//                         tileContent={({ date }) =>
//                             isDayWithEvent(date) ? (
//                                 <div className="event-dot"></div>
//                             ) : null
//                         }
//                     />
//                 </div>

//                 <div className="calendar-right">
//                     {selectedWeek.length > 0 ? (
//                         <div className="week-details">
//                             <h2>Events for the week:</h2>
//                             {selectedWeek.map((day, index) => {
//                                 const formattedDate = day.format("YYYY-MM-DD");
//                                 const isActive =
//                                     selectedDate &&
//                                     day.format("YYYY-MM-DD") ===
//                                     selectedDate.format("YYYY-MM-DD");

//                                 return (
//                                     <div
//                                         key={index}
//                                         ref={(el) =>
//                                         (dayRefs.current[formattedDate] =
//                                             el)
//                                         }
//                                         className={`day-details ${isActive ? "active-day" : ""
//                                             }`}
//                                         onClick={() => setSelectedDate(day)}
//                                     >
//                                         <h3>
//                                             {day.format("dddd, MMMM Do YYYY")}
//                                         </h3>
//                                         <ul>
//                                             {/* {events[formattedDate] ? (
//                                                 events[formattedDate].map(
//                                                     (e, idx) => (
//                                                         <li key={idx}>
//                                                             {e.time}: {e.event}
//                                                         </li>
//                                                     )
//                                                 )
//                                             ) : (
//                                                 <li>No events</li>
//                                             )} */}

//                                              {events[formattedDate] ? (
//                                                 events[formattedDate].map(
//                                                     (e, idx) => (
//                                                         <li key={idx}>
//                                                             {e.time}:{" "}
//                                                             {e.board_title && (
//                                                                 <strong><i>[PROJECT: {e.board_title}]</i></strong>
//                                                             )}{"______"}
//                                                             {e.event}
//                                                         </li>
//                                                     )
//                                                 )
//                                             ) : (
//                                                 <li>No events</li>
//                                             )}


//                                         </ul>
//                                     </div>
//                                 );
//                             })}
//                         </div>
//                     ) : (
//                         <p>Select a date to view the week's events.</p>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Calendar;


import React, { useState, useEffect, useMemo } from "react";
import moment from "moment";
import { useNavigate } from "react-router-dom";

import { Calendar as BigCalendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css"; 

// import "moment/locale/vi"; // Import locale tiếng Việt cho moment

import "./Calendar.css"; 
import "../general/MainContentContainer.css";
import { useUser } from "../../context/UserContext";
import { useBoard } from "../../context/BoardContext";

const localizer = momentLocalizer(moment);
moment.locale('vi'); 

const Calendar = () => {
    const [events, setEvents] = useState([]);
    const { user, getUserCardsIncoming } = useUser();
    const { getBoardTitleById, boards } = useBoard(); 

    const navigate = useNavigate();

    useEffect(() => {
        if (user && user._id) {
            getUserCardsIncoming(user._id)
                .then((cards) => {
                    const formattedEvents = cards.map((card) => {
                        const boardTitle = getBoardTitleById(card.board_id);

                        const eventTitle = `[Project: ${boardTitle || 'Không xác định'}] :   ${card.card_title}`;

                        return {
                            id: card._id,
                            title: eventTitle, 
                            start: moment(card.created_at).toDate(), 
                            end: moment(card.due_date).toDate(),     
                            allDay: false, 
                            resource: { 
                                board_id: card.board_id,
                                board_title: boardTitle, 
                                card_id: card._id
                            }
                        };
                    });
                    setEvents(formattedEvents);
                })
                .catch((error) => {
                    console.error("Failed to fetch user cards:", error);
                });
        }
    }, [user, getUserCardsIncoming, getBoardTitleById, boards]);


    // Các cấu hình cho React Big Calendar (dùng useMemo để tối ưu)
    const { defaultDate, views, formats } = useMemo(
        () => ({
            defaultDate: new Date(),
            views: ["month", "week", "day", "agenda"],
            formats: {
                timeGutterFormat: "HH:mm", // Định dạng thời gian ở cột bên trái
                eventTimeRangeFormat: ({ start, end }, culture, local) =>
                    local.format(start, "HH:mm", culture) + " - " + local.format(end, "HH:mm", culture),
                dayFormat: "dddd DD/MM", // Định dạng ngày trong chế độ xem tuần/ngày
                dayHeaderFormat: "dddd, D MMMM", // Định dạng tiêu đề ngày (e.g., Thứ Hai, 24 Tháng Sáu)
            },
        }),
        []
    );

    const handleSelectEvent = (event) => {
        console.log("Selected event:", event);
        if (event.resource && event.resource.board_id && event.resource.card_id) {
            navigate(`/board/${event.resource.board_id}/card/${event.resource.card_id}`);
        }
    };

    // Xử lý khi chọn một khoảng trống trên lịch để thêm sự kiện mới
    const handleSelectSlot = (slotInfo) => {
        console.log("Selected slot:", slotInfo);
    };

    // Tùy chỉnh màu sự kiện dựa trên dữ liệu (sử dụng logic hash để có màu đa dạng)
    const eventPropGetter = (event) => {
        let style = {
            backgroundColor: '#4285F4',
            borderRadius: '4px',
            opacity: 0.9,
            color: 'white',
            border: '0px',
            display: 'block',
            fontWeight: 'normal',
        };

        if (event.resource && event.resource.board_id) {
            const boardIdHash = event.resource.board_id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const colors = ['#f4b400', '#0f9d58', '#db4437', '#4285F4', '#7c4dff', '#00bcd4', '#ff8a65'];
            style.backgroundColor = colors[boardIdHash % colors.length];
        }
        return { style };
    };

    const dayPropGetter = (date) => {
        const formattedDate = moment(date).format("YYYY-MM-DD");
        const hasEvent = events.some(event => moment(event.start).format("YYYY-MM-DD") === formattedDate);

        if (hasEvent) {
            return {
                className: 'day-with-event', 
            };
        }
        return {};
    };

    return (
        <div className="main-content-container">
            <div className="react-big-calendar-wrapper">
                <BigCalendar
                    localizer={localizer}
                    events={events} 
                    defaultDate={defaultDate}
                    views={views}
                    defaultView="month"
                    style={{ height: 700 }}
                    selectable={true}
                    onSelectEvent={handleSelectEvent}
                    onSelectSlot={handleSelectSlot}
                    eventPropGetter={eventPropGetter}
                    dayPropGetter={dayPropGetter}
                    formats={formats}
                    // messages={{
                    //     next: "Next",
                    //     previous: "Previous",
                    //     today: "Today",
                    //     month: "Month",
                    //     week: "Week",
                    //     day: "Day",
                    //     agenda: "List",
                    //     noEventsInRange: "There are no events in this period.",
                    // }}
                    culture="en"
                />
            </div>
        </div>
    );
};

export default Calendar;