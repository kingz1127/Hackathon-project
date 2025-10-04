import { useState } from "react";
import "./calendar.css"; // import the CSS file

export default function Calendar({ events, months, onSelect }) {
  const [expandedMonth, setExpandedMonth] = useState(months[0]); // default = current month

  // 🔹 Group events by month
  const eventsByMonth = months.reduce((acc, month) => {
    acc[month] = events.filter((event) => {
      const eventMonth = new Date(event.date).toLocaleString("default", { month: "long" });
      return eventMonth === month;
    });
    return acc;
  }, {});

  return (
    <div className="calendar-container">
      <h2 className="calendar-title">Calendar</h2>

      {/* 🔹 List months */}
      <div className="month-list">
        {months.map((month) => (
          <div key={month} className="month-section">
            {/* Month Header */}
            <button
              onClick={() =>
                setExpandedMonth(expandedMonth === month ? null : month)
              }
              className="month-button"
            >
              {month}
              <span className="month-arrow">
                {expandedMonth === month ? "▲" : "▼"}
              </span>
            </button>

            {/* Events inside month */}
            {expandedMonth === month && (
              <ul className="events-list">
                {eventsByMonth[month].length > 0 ? (
                  eventsByMonth[month].map((event) => (
                    <li
                      key={event._id}
                      className="event-item"
                      onClick={() => onSelect(event)}
                    >
                      <p className="event-title">{event.title}</p>
                      <p className="event-details">
                        {new Date(event.date).toLocaleDateString()} —{" "}
                        {event.location}
                      </p>
                    </li>
                  ))
                ) : (
                  <p className="no-events">No events this month.</p>
                )}
              </ul>
            )}
          </div>
        ))} 
      </div>
    </div>
  );
}
