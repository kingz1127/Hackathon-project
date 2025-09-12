// src/pages/Announcements.jsx
import { useState } from "react";
import "../Styles/Teacher.css";

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([
    {
      id: 1,
      title: "Exam Schedule",
      message: "The midterm exams will begin next Monday. Please check the timetable.",
      author: "Admin",
      date: "2025-08-27",
    },
    {
      id: 2,
      title: "Holiday Notice",
      message: "School will remain closed this Friday for a public holiday.",
      author: "Principal",
      date: "2025-08-25",
    },
  ]);

  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    message: "",
    author: "",
  });

  const handleChange = (e) => {
    setNewAnnouncement({ ...newAnnouncement, [e.target.name]: e.target.value });
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newAnnouncement.title || !newAnnouncement.message) return;

    const newItem = {
      id: announcements.length + 1,
      ...newAnnouncement,
      date: new Date().toISOString().split("T")[0],
    };

    setAnnouncements([newItem, ...announcements]);
    setNewAnnouncement({ title: "", message: "", author: "" });
  };

  return (
    <div>
      <h2>Announcements</h2>

      {/* Form to add announcements */}
      <form className="announcement-form" onSubmit={handleAdd}>
        <input
          type="text"
          name="title"
          placeholder="Announcement Title"
          value={newAnnouncement.title}
          onChange={handleChange}
        />
        <textarea
          name="message"
          placeholder="Write your message..."
          value={newAnnouncement.message}
          onChange={handleChange}
        />
        <input
          type="text"
          name="author"
          placeholder="Your Name"
          value={newAnnouncement.author}
          onChange={handleChange}
        />
        <button type="submit">Post Announcement</button>
      </form>

      {/* Announcement list */}
      <div className="announcement-list">
        {announcements.map((a) => (
          <div key={a.id} className="announcement-card">
            <h4>{a.title}</h4>
            <div className="announcement-meta">
              {a.date} • {a.author}
            </div>
            <p>{a.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
