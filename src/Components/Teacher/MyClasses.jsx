// src/pages/MyClasses.jsx
import { useEffect, useState } from "react";
import { FaBookOpen, FaEdit, FaUpload } from "react-icons/fa";
import "../Styles/Teacher.css"; // <-- custom css file

export default function MyClasses() {
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    setClasses([
      { id: 1, title: "React", description: "A JavaScript library for building fast, interactive, and reusable user interfaces." },
      { id: 2, title: "Spring Boot", description: "A Java framework for building scalable, production-ready backend applications quickly." },
      { id: 3, title: "Computer Science", description: "Intro to Programming" },
    ]);
  }, []);

  return (
    <div className="myclasses-container">
      {/* Header */}
      <div className="myclasses-header">
        <h2>📚 My Classes</h2>
        <button className="add-class-btn">+ Add New Class</button>
      </div>

      {/* Classes Grid */}
      <div className="classes-grid">
        {classes.map((cls) => (
          <div key={cls.id} className="class-card">
            <div className="class-title">
              <FaBookOpen className="icon" />
              <h3>{cls.title}</h3>
            </div>
            <p className="class-desc">{cls.description}</p>
            <div className="class-actions">
              <button className="upload-btn">
                <FaUpload /> Upload
              </button>
              <button className="edit-btn">
                <FaEdit /> Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
    
  );
}
