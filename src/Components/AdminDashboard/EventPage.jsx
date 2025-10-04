import React, { useState, useEffect } from "react";
import Calendar from "./UI/Calendar";
import EventModal from "./UI/EventModal";
import EventForm from "./UI/EventForm";
import { Search, Filter, Plus, Edit, Trash2 } from "lucide-react";
import axios from "axios";
import "./EventPage.css"; // Import the CSS file

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventToEdit, setEventToEdit] = useState(null);
  const [formModalOpen, setFormModalOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const today = new Date();

  // ✅ Fetch events on page load
  useEffect(() => {
    axios.get("http://localhost:5000/api/events")
      .then(res => setEvents(res.data))
      .catch(err => console.error("❌ Error fetching events:", err));
  }, []);

  // Filter + Search + Sort
  const filteredEvents = events
    .filter((event) => {
      const eventDate = new Date(event.date);
      if (filter === "upcoming") return eventDate >= today;
      if (filter === "past") return eventDate < today;
      return true;
    })
    .filter((event) => {
      const query = search.toLowerCase();
      return (
        event.title.toLowerCase().includes(query) ||
        new Date(event.date).toDateString().toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query) ||
        event.organizer?.toLowerCase().includes(query) ||
        (event.participants || []).some((p) => p.toLowerCase().includes(query))
      );
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // Add new event
  const handleAdd = () => {
    setEventToEdit(null);
    setFormModalOpen(true);
  };

  // Edit existing event
  const handleEdit = (event) => {
    setEventToEdit(event);
    setFormModalOpen(true);
  };

  // Save event (add or edit)
  const handleSave = async (newEvent, id) => {
    try {
      if (id) {
        const { data } = await axios.put(`http://localhost:5000/api/events/${id}`, newEvent);
        setEvents(events.map((e) => (e._id === id ? data : e)));
      } else {
        const { data } = await axios.post("http://localhost:5000/api/events", newEvent);
        setEvents([...events, data]);
      }
      setFormModalOpen(false);
    } catch (err) {
      console.error("❌ Error saving event:", err);
    }
  };

  // Delete event
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/events/${id}`);
      setEvents(events.filter((e) => e._id !== id));
    } catch (err) {
      console.error("❌ Error deleting event:", err);
    }
  };

  // Calendar months
  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];
  const currentMonthIndex = new Date().getMonth();
  const rotatedMonths = [
    ...months.slice(currentMonthIndex),
    ...months.slice(0, currentMonthIndex),
  ];

  return (
    <div className="events-container">
      {/* Title */}
      <h1 className="page-title">Admin – Events & Calendar</h1>

      {/* Search + Filter Controls */}
      <div className="controls">
        {/* Search Bar */}
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

        {/* Filter */}
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

      {/* Layout */}
      <div className="layout-grid">
        {/* Calendar */}
        <div className="calendar-section">
          <Calendar
            events={filteredEvents}
            months={rotatedMonths}
            onSelect={setSelectedEvent}
          /> 
        </div>

        {/* Manage Events List */}
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

      {/* Event Details Modal */}
      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}

      {/* Add/Edit Form Modal */}
      {formModalOpen && (
        <EventForm
          event={eventToEdit}
          onSave={handleSave}
          onClose={() => setFormModalOpen(false)}
        />
      )}

      {/* Floating Action Button */}
      <button
        onClick={handleAdd}
        className="fab"
      >
        <Plus size={24} />
      </button>
    </div>
  );
}
