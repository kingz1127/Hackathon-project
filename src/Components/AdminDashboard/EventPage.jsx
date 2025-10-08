import React, { useState, useEffect } from "react";
import Calendar from "./UI/Calendar";
import EventModal from "./UI/EventModal";
import EventForm from "./UI/EventForm";
import { Search, Filter, Plus, Edit, Trash2 } from "lucide-react";
import axios from "axios";
import "./EventPage.css";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventToEdit, setEventToEdit] = useState(null);
  const [formModalOpen, setFormModalOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const today = new Date();

  useEffect(() => {
    axios.get("http://localhost:5000/api/events")
      .then(res => setEvents(res.data))
      .catch(err => console.error("Error fetching events:", err));
  }, []);

  const filteredEvents = events
    .filter((event) => {
      const eventDate = new Date(event.date);
      if (filter === "upcoming") return eventDate >= today;
      if (filter === "past") return eventDate < today;
      return true;
    })
    .filter((event) => {
      const query = search.toLowerCase();
      const title = event.title?.toLowerCase() || "";
      const location = event.location?.toLowerCase() || "";
      const organizer = event.organizer?.toLowerCase() || "";
      const dateStr = new Date(event.date).toDateString().toLowerCase();
      const participants = (event.participants || []).map(p => p?.toLowerCase() || "");
      return (
        title.includes(query) ||
        dateStr.includes(query) ||
        location.includes(query) ||
        organizer.includes(query) ||
        participants.some(p => p.includes(query))
      );
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const handleAdd = () => {
    setEventToEdit(null);
    setFormModalOpen(true);
  };

  const handleEdit = (event) => {
    setEventToEdit(event);
    setFormModalOpen(true);
  };

  const handleSave = async (newEvent, id) => {
    try {
      let savedEvent;

      if (id) {
        const { data } = await axios.put(`http://localhost:5000/api/events/${id}`, newEvent);
        setEvents(events.map((e) => (e._id === id ? data : e)));
        savedEvent = data;
      } else {
        const { data } = await axios.post("http://localhost:5000/api/events", newEvent);
        // Handle both {event: {...}} and direct {...} responses safely
        const eventData = data.event || data;
        setEvents([...events, eventData]);
        savedEvent = eventData;

        await sendEventNotifications(savedEvent);
      }

      setFormModalOpen(false);
    } catch (err) {
      console.error("Error saving event:", err);
    }
  };

  // In your EventsPage.jsx, update the sendEventNotifications function:

const sendEventNotifications = async (event) => {
  try {
    console.log("🔔 Starting to send event notifications for:", event.title);

    const [teachersRes, studentsRes] = await Promise.all([
      axios.get("http://localhost:5000/admin/teachers"),
      axios.get("http://localhost:5000/admin/students")
    ]);

    const teachers = teachersRes.data;
    const students = studentsRes.data;

    console.log("📚 Found teachers:", teachers.length);
    console.log("👨‍🎓 Found students:", students.length);

    const notificationContent = `📢 New event: ${event.title}\n${event.description || ''}\nDate: ${new Date(event.date).toLocaleDateString()}\nLocation: ${event.location || 'TBA'}`;

    const teacherNotifications = teachers.map(teacher => {
      console.log("Sending to teacher ID:", teacher.id); // Use teacher.id (login ID)
      return axios.post("http://localhost:5000/messages/send", {
        senderId: "admin",
        senderName: "Admin",
        receiverId: teacher.teacherId, // 👈 Use teacher.id instead of teacher._id
        content: notificationContent,
        eventId: event._id,
        isEventNotification: true
      });
    });

    const studentNotifications = students.map(student => {
      console.log("Sending to student ID:", student.studentId); // Use student.studentId (login ID)
      return axios.post("http://localhost:5000/messages/send", {
        senderId: "admin",
        senderName: "Admin",
        receiverId: student.studentId, // 👈 Use student.studentId instead of student._id
        content: notificationContent,
        eventId: event._id,
        isEventNotification: true
      });
    });

    const results = await Promise.all([...teacherNotifications, ...studentNotifications]);

    console.log("✅ Event notifications sent successfully! Total:", results.length);
    alert(`Event created! Notifications sent to ${teachers.length} teachers and ${students.length} students.`);
  } catch (err) {
    console.error("❌ Error sending event notifications:", err);
    console.error("Error details:", err.response?.data);
    alert("Event created but failed to send some notifications. Check console for details.");
  }
};

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/events/${id}`);
      setEvents(events.filter((e) => e._id !== id));
    } catch (err) {
      console.error("Error deleting event:", err);
    }
  };

  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  return (
    <div className="events-container">
      <h1 className="page-title">Admin – Events & Calendar</h1>

      <div className="controls">
        <div className="search-container">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Search events..."
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-container">
          <Filter size={18} className="filter-icon" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Events</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
          </select>
        </div>
      </div>

      <div className="layout-grid">
        <div className="calendar-section">
          <Calendar
            events={filteredEvents}
            months={months}
            onSelect={setSelectedEvent}
          /> 
        </div>

        <div className="manage-events">
          <h2 className="manage-title">Manage Events</h2>
          <ul className="events-list">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => (
                <li key={event._id} className="event-card">
                  <div className="event-card-header">
                    <div
                      className="event-card-info"
                      onClick={() => setSelectedEvent(event)}
                    >
                      <h3 className="event-name">{event.title}</h3>
                      <p className="event-date">
                        {new Date(event.date).toDateString()}
                      </p>
                      <p className="event-location">{event.location}</p>
                    </div>
                    <div className="event-actions">
                      <button
                        onClick={() => handleEdit(event)}
                        className="edit-btn"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(event._id)}
                        className="delete-btn"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <p className="no-events">No events found.</p>
            )}
          </ul>
        </div>
      </div>

      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}

      {formModalOpen && (
        <EventForm
          event={eventToEdit}
          onSave={handleSave}
          onClose={() => setFormModalOpen(false)}
        />
      )}

      <button
        onClick={handleAdd}
        className="fab"
      >
        <Plus size={24} />
      </button>
    </div>
  );
}