import { useState, useEffect } from "react";
import "./EventForm.css"; // import the CSS file

export default function EventForm({ event, onSave, onClose }) {
  const [form, setForm] = useState({
    title: "",
    date: "",
    location: "",
    organizer: "",
    participants: "",
  });

  // ✅ Pre-fill form if editing
  useEffect(() => {
    if (event) {
      setForm({
        title: event.title || "",
        date: event.date
          ? new Date(event.date).toISOString().split("T")[0] // format YYYY-MM-DD
          : "",
        location: event.location || "",
        organizer: event.organizer || "",
        participants: Array.isArray(event.participants)
          ? event.participants.join(", ")
          : event.participants || "",
      });
    }
  }, [event]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newEvent = {
      ...form,
      participants: form.participants
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean),
    };
    onSave(newEvent, event?._id); // pass id if editing
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2 className="modal-title">
          {event ? "Edit Event" : "Add Event"}
        </h2>

        <form onSubmit={handleSubmit} className="event-form">
          <input
            type="text"
            placeholder="Event Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="form-input"
            required
          />
          <input
            type="date"
            value={form.date}
            min={new Date().toISOString().split("T")[0]} // ✅ prevents past dates
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="form-input"
            required
          />
          <input
            type="text"
            placeholder="Location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="form-input"
          />
          <input
            type="text"
            placeholder="Organizer"
            value={form.organizer}
            onChange={(e) => setForm({ ...form, organizer: e.target.value })}
            className="form-input"
          />
          <input
            type="text"
            placeholder="Participants (comma-separated)"
            value={form.participants}
            onChange={(e) => setForm({ ...form, participants: e.target.value })}
            className="form-input"
          />

          {/* Actions */}
          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn cancel-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn submit-btn"
            >
              {event ? "Save Changes" : "Add Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
