import { useEffect, useState } from "react";
import "./AnnoucementStudent.css";

export default function AnnouncementStudent() {
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
    <div className="announcements-container2">
      <h2 className="annh2">📢 Announcements</h2>
      <div className="events-list">
        {events.map(event => (
          <div key={event._id} className="event-card">
            <h3>{event.title}</h3>
            <p>{event.description}</p>
            <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
            {event.location && <p><strong>Location:</strong> {event.location}</p>}
            {event.organizer && <p><strong>Organizer:</strong> {event.organizer}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}