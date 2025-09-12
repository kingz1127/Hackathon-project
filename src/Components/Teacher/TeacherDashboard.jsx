// src/pages/TeacherDashboard.jsx
import { FaBell, FaChalkboard, FaChalkboardTeacher, FaEnvelope, FaTasks, FaUserGraduate } from "react-icons/fa";
import "./Teacher.css";

export default function TeacherDashboard() {
  return (
      <div className="main-content">
        {/* Header */}
        <div className="header">
          <h1 className="page-title">Teacher Dashboard</h1>
          <div className="notification-bell">
            <FaBell />
            <div className="notification-badge">3</div>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="dashboard-cards">
          <div className="card">
            <div className="card-header">
              <div className="card-title">Classes Teaching</div>
              <div className="card-icon" style={{ backgroundColor: "#e8f8f5", color: "var(--teal)" }}>
                <FaChalkboardTeacher />
              </div>
            </div>
            <div className="card-value">5</div>
            <div className="card-description">Active classes this semester</div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">Students</div>
              <div className="card-icon" style={{ backgroundColor: "#eaf2f8", color: "var(--blue)" }}>
                <FaUserGraduate />
              </div>
            </div>
            <div className="card-value">142</div>
            <div className="card-description">Total students</div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">Assignments Due</div>
              <div className="card-icon" style={{ backgroundColor: "#fef9e7", color: "var(--accent)" }}>
                <FaTasks />
              </div>
            </div>
            <div className="card-value">7</div>
            <div className="card-description">To be graded this week</div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">Unread Messages</div>
              <div className="card-icon" style={{ backgroundColor: "#f5eef8", color: "var(--purple)" }}>
                <FaEnvelope />
              </div>
            </div>
            <div className="card-value">3</div>
            <div className="card-description">From students & parents</div>
          </div>
        </div>

        {/* Classes Section */}
        <h2 className="section-title"><FaChalkboard /> My Classes</h2>

        {/* Example Classes Grid */}
        <div className="classes-grid">
          <div className="class-card">
            <div className="class-header">
              <h3 className="class-title">Simple Arithmetics</h3>
              <div className="class-meta">
                <span><i className="fas fa-clock"></i> Mon/Wed 9:00-10:30</span>
                <span><i className="fas fa-map-marker-alt"></i> Bldg A-205</span>
              </div>
            </div>
            <div className="class-body">
              <div className="class-stats">
                <div className="stat-item"><div className="stat-value">32</div><div className="stat-label">Students</div></div>
                <div className="stat-item"><div className="stat-value">4</div><div className="stat-label">Assignments</div></div>
                <div className="stat-item"><div className="stat-value">92%</div><div className="stat-label">Attendance</div></div>
              </div>
              <div className="class-actions">
                <button className="btn btn-primary"><i className="fas fa-clipboard-list"></i> Attendance</button>
                <button className="btn btn-secondary"><i className="fas fa-book"></i> Materials</button>
              </div>
            </div>
          </div>
        </div>

        {/* Assignments Section */}
        <h2 className="section-title" style={{ marginTop: "30px" }}>
          <FaTasks /> Assignments to Grade
        </h2>

        <div className="assignments-table">
          <div className="table-header">
            <div>Assignment</div>
            <div>Class</div>
            <div>Due Date</div>
            <div>Status</div>
          </div>

          <div className="table-row">
            <div className="assignment-name">Chapter 5 Quiz</div>
            <div className="class-name">Learning LCM</div>
            <div className="due-date">Tomorrow</div>
            <div className="status-badge status-pending">Pending</div>
          </div>
        </div>
      </div>
  );
}
