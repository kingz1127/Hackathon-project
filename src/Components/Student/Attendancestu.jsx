import {
  ArrowUp,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  FileText,
  XCircle
} from "lucide-react";
import { useEffect, useState } from "react";
import "./attendance.css";

export default function Attendancestu() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("daily");
  const [student, setStudent] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [refreshToggle, setRefreshToggle] = useState(false); // 🔄 added for refetch

  const studentId = localStorage.getItem("studentId");

  // Fetch logged-in student info
  useEffect(() => {
    if (!studentId) return;

    fetch(`http://localhost:5000/students/${studentId}`)
      .then(res => res.json())
      .then(data => setStudent(data))
      .catch(err => console.error("Error fetching student:", err));
  }, [studentId]);

  // Fetch attendance for logged-in student
  const fetchAttendance = () => {
    if (!studentId) return;

    fetch(`http://localhost:5000/attendance/student/${studentId}`)
      .then(res => res.json())
      .then(records => setAttendanceRecords(records))
      .catch(err => console.error("Error fetching attendance:", err));
  };

  useEffect(() => {
    fetchAttendance();
  }, [studentId, refreshToggle]); // 🔄 refetch when refreshToggle flips

  // 🔄 Function you can call after update
  const refreshAttendance = () => setRefreshToggle(prev => !prev);

  // Attendance stats
  const totalSessions = attendanceRecords.length;
  const presentCount = attendanceRecords.filter(r => r.status === "Present").length;
  const absentCount = attendanceRecords.filter(r => r.status === "Absent").length;
  const lateCount = attendanceRecords.filter(r => r.status === "Late").length;

  // Month selector
  const updateMonth = (offset) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  const formattedMonth = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <main className="main-content">
      {/* Header */}
      <div className="header">
        <div className="page-title">
          <h1>Class Attendance Tracker</h1>
          <p>Monitor your attendance and lab sessions</p>
        </div>

        {student && (
          <div className="user-profile">
            <span>{student.fullName}</span>
            <img src={student.studentImg} alt="User Profile" width={80} />
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card overall">
          <h3>Overall Attendance Rate</h3>
          <div className="value">
            {totalSessions > 0 ? ((presentCount / totalSessions) * 100).toFixed(1) : 0}%
          </div>
          <div className="change positive">
            <ArrowUp size={16} /> Compared to last month
          </div>
        </div>

        <div className="stat-card present">
          <h3>Present</h3>
          <div className="value">{presentCount}</div>
          <div className="change positive">
            <CheckCircle size={16} /> Consistent
          </div>
        </div>

        <div className="stat-card absent">
          <h3>Absent</h3>
          <div className="value">{absentCount}</div>
          <div className="change negative">
            <XCircle size={16} /> {absentCount} excused
          </div>
        </div>

        <div className="stat-card late">
          <h3>Late Arrivals</h3>
          <div className="value">{lateCount}</div>
          <div className="change">
            <Clock size={16} /> All lab sessions
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="action-bar">
        <div className="month-selector">
          <button className="month-btn" onClick={() => updateMonth(-1)}>
            <ChevronLeft size={18} />
          </button>
          <div className="month-display">{formattedMonth}</div>
          <button className="month-btn" onClick={() => updateMonth(1)}>
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="view-selector">
          <button className={`view-btn ${view === "daily" ? "active" : ""}`} onClick={() => setView("daily")}>Daily</button>
          <button className={`view-btn ${view === "weekly" ? "active" : ""}`} onClick={() => setView("weekly")}>Weekly</button>
          <button className={`view-btn ${view === "monthly" ? "active" : ""}`} onClick={() => setView("monthly")}>Monthly</button>
        </div>

        <div className="action-buttons">
          <button className="btn btn-secondary" onClick={refreshAttendance}>
            <Download size={16} /> Refresh
          </button>
          <button className="btn btn-primary">
            <FileText size={16} /> Request Leave
          </button>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="attendance-container">
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Tech Subject</th>
              <th>Instructor</th>
              <th>Session Type</th>
              <th>Status</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {attendanceRecords.map(record => (
              <tr key={record._id}>
                <td>{new Date(record.date).toLocaleDateString()}</td>
                <td className="subject-name">
                  {record.subject} <span className="tech-badge">{record.sessionType}</span>
                </td>
                <td>{record.teacherName}</td>
                <td>{record.sessionType}</td>
                <td className={`status-${record.status.toLowerCase()}`}>{record.status}</td>
                <td>{record.createdAt || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
