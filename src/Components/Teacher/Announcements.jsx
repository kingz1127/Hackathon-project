import { useEffect, useState } from "react";
import "./Teacher.css";

export default function Announcements() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/events");
        if (!res.ok) throw new Error("Failed to fetch events");
        const data = await res.json();
        setEvents(data);
      } catch (err) {
        console.error("Error fetching events:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
    
    // Poll for new events every 30 seconds
    const interval = setInterval(fetchEvents, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <p>Loading announcements...</p>;

  if (events.length === 0)
    return <p>No announcements at the moment.</p>;

  return (
    <div className="announcements-container">
      <h2>📢 Announcements</h2>
      <div className="events-list">
        {events.map(event => (
          <div key={event._id} className="event-card">
            <h3 className="announcement-title">{event.title}</h3>
            <p className="announcement-desc">{event.description}</p>
            <p className="announcement-date"><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
            {event.location && <p><strong>Location:</strong> {event.location}</p>}
            {event.organizer && <p><strong>Organizer:</strong> {event.organizer}</p>}
            {event.participants && <p><strong>Participants: </strong> {event.participants}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}