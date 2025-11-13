import axios from "axios";
import { useEffect, useState } from "react";
import "./Teacher.css";

export default function Announcements() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    organizer: "",
    participants: ""
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/events");
      setEvents(res.data);
    } catch (err) {
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const newEvent = {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        location: formData.location || undefined,
        organizer: formData.organizer || undefined,
        participants: formData.participants || undefined
      };

      const { data } = await axios.post("http://localhost:5000/api/events", newEvent);
      const eventData = data.event || data;
      
      setEvents([...events, eventData]);
      setIsModalOpen(false);
      setFormData({
        title: "",
        description: "",
        date: "",
        location: "",
        organizer: "",
        participants: ""
      });
    } catch (err) {
      console.error("Error creating event:", err);
      alert("Failed to create announcement. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      title: "",
      description: "",
      date: "",
      location: "",
      organizer: "",
      participants: ""
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="spinner"></div>
          <p>Loading announcements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="announcements-page">
      <div className="announcements-wrapper">
        {/* Header */}
        <div className="announcements-header">
          <div className="header-left">
            <span className="header-icon">📢</span>
            <h1>Announcements</h1>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="add-btn">
            <span className="plus-icon">+</span>
            Add Announcement
          </button>
        </div>

        {/* Events List */}
        {events.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📭</span>
            <p className="empty-title">No announcements at the moment.</p>
            <p className="empty-subtitle">Click "Add Announcement" to create one!</p>
          </div>
        ) : (
          <div className="events-grid">
            {events.map(event => (
              <div key={event._id} className="event-card">
                <h3 className="event-title">{event.title}</h3>
                <p className="event-description">{event.description}</p>
                
                <div className="event-details">
                  <div className="detail-item">
                    <span className="detail-label">📅 Date:</span>
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  
                  {event.location && (
                    <div className="detail-item">
                      <span className="detail-label">📍 Location:</span>
                      <span>{event.location}</span>
                    </div>
                  )}
                  
                  {event.organizer && (
                    <div className="detail-item">
                      <span className="detail-label">👤 Organizer:</span>
                      <span>{event.organizer}</span>
                    </div>
                  )}
                  
                  {event.participants && (
                    <div className="detail-item">
                      <span className="detail-label">👥 Participants:</span>
                      <span>{event.participants}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Create New Announcement</h2>
                <button onClick={handleCloseModal} className="close-btn">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-group">
                  <label>
                    Title <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter announcement title"
                  />
                </div>

                <div className="form-group">
                  <label>
                    Description <span className="required">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    placeholder="Enter announcement description"
                  />
                </div>

                <div className="form-group">
                  <label>
                    Date <span className="required">*</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    Location <span className="optional">(optional)</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Enter event location"
                  />
                </div>

                <div className="form-group">
                  <label>
                    Organizer <span className="optional">(optional)</span>
                  </label>
                  <input
                    type="text"
                    name="organizer"
                    value={formData.organizer}
                    onChange={handleInputChange}
                    placeholder="Enter organizer name"
                  />
                </div>

                <div className="form-group">
                  <label>
                    Participants <span className="optional">(optional)</span>
                  </label>
                  <input
                    type="text"
                    name="participants"
                    value={formData.participants}
                    onChange={handleInputChange}
                    placeholder="Enter participants"
                  />
                </div>

                <div className="form-actions">
                  <button type="button" onClick={handleCloseModal} className="cancel-btn">
                    Cancel
                  </button>
                  <button type="submit" className="submit-btn" disabled={submitting}>
                    {submitting ? "Creating..." : "Create Announcement"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}