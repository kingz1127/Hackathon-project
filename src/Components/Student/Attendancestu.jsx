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
  const [allAttendanceRecords, setAllAttendanceRecords] = useState([]); // Store all records
  const [refreshToggle, setRefreshToggle] = useState(false);

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

    console.log("🔄 Fetching attendance records for student:", studentId);
    
    fetch(`http://localhost:5000/attendance/student/${studentId}`)
      .then(res => res.json())
      .then(records => {
        console.log("📊 All attendance records received:", records);
        setAllAttendanceRecords(records); // Store all records
        filterRecordsByMonth(records, currentDate); // Filter by current month
      })
      .catch(err => console.error("❌ Error fetching attendance:", err));
  };

  // Filter attendance records by selected month and year
  const filterRecordsByMonth = (records, selectedDate) => {
    const selectedMonth = selectedDate.getMonth();
    const selectedYear = selectedDate.getFullYear();
    
    console.log(`📅 Filtering records for ${selectedYear}-${selectedMonth + 1}`);
    
    const filteredRecords = records.filter(record => {
      const recordDate = new Date(record.date);
      const recordMonth = recordDate.getMonth();
      const recordYear = recordDate.getFullYear();
      
      return recordMonth === selectedMonth && recordYear === selectedYear;
    });
    
    console.log(`📋 Filtered records for selected month:`, filteredRecords);
    setAttendanceRecords(filteredRecords);
  };

  // When currentDate changes, filter the records
  useEffect(() => {
    if (allAttendanceRecords.length > 0) {
      filterRecordsByMonth(allAttendanceRecords, currentDate);
    }
  }, [currentDate, allAttendanceRecords]);

  useEffect(() => {
    fetchAttendance();
  }, [studentId, refreshToggle]);

  // 🔄 Function you can call after update
  const refreshAttendance = () => setRefreshToggle(prev => !prev);

  // Attendance stats (for current filtered month)
  const totalSessions = attendanceRecords.length;
  const presentCount = attendanceRecords.filter(r => 
    r.status && (r.status.toLowerCase() === "present" || r.status.toLowerCase() === "Present")
  ).length;
  const absentCount = attendanceRecords.filter(r => 
    r.status && (r.status.toLowerCase() === "absent" || r.status.toLowerCase() === "Absent")
  ).length;
  const leaveCount = attendanceRecords.filter(r => 
    r.status && (r.status.toLowerCase() === "leave" || r.status.toLowerCase() === "Leave")
  ).length;
  const lateCount = attendanceRecords.filter(r => 
    r.status && (r.status.toLowerCase() === "late" || r.status.toLowerCase() === "Late")
  ).length;

  // Month selector
  const updateMonth = (offset) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
    console.log("📅 Month changed to:", newDate.toLocaleDateString("en-US", { month: "long", year: "numeric" }));
  };

  // Go to current month
  const goToCurrentMonth = () => {
    const now = new Date();
    setCurrentDate(now);
    console.log("📅 Navigated to current month:", now.toLocaleDateString("en-US", { month: "long", year: "numeric" }));
  };

  const formattedMonth = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  // Check if we're viewing the current month
  const isCurrentMonth = () => {
    const now = new Date();
    return currentDate.getMonth() === now.getMonth() && 
           currentDate.getFullYear() === now.getFullYear();
  };

  // Get month summary text
  const getMonthSummary = () => {
    if (totalSessions === 0) {
      return "No attendance records for this month";
    }
    
    const attendanceRate = totalSessions > 0 ? ((presentCount / totalSessions) * 100).toFixed(1) : 0;
    return `${totalSessions} sessions • ${attendanceRate}% attendance rate`;
  };

  return (
    <main className="main-content">
      <div className="mainContent2">
      {/* Header */}
      <div className="header">
        <div className="page-title">
          <h1>Class Attendance Tracker</h1>
          <p>Monitor your attendance and lab sessions</p>
          {/* Month Summary */}
          <div style={{ 
            marginTop: '10px', 
            padding: '8px 12px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '4px', 
            fontSize: '14px',
            color: '#666'
          }}>
            📅 {formattedMonth} • {getMonthSummary()}
          </div>
        </div>

        {student && (
          <div className="user-profile">
            <span>{student.fullName}</span>
            <img src={student.studentImg} alt="User Profile" width={80} />
          </div>
        )}
      </div>

      {/* Stats - Now showing data for selected month */}
      <div className="stats-grid">
        <div className="stat-card overall">
          <h3>Monthly Attendance Rate</h3>
          <div className="value">
            {totalSessions > 0 ? ((presentCount / totalSessions) * 100).toFixed(1) : 0}%
          </div>
          <div className="change positive">
            <ArrowUp size={16} /> For {formattedMonth}
          </div>
        </div>

        <div className="stat-card present">
          <h3>Present</h3>
          <div className="value">{presentCount}</div>
          <div className="change positive">
            <CheckCircle size={16} /> This month
          </div>
        </div>

        <div className="stat-card absent">
          <h3>Absent</h3>
          <div className="value">{absentCount}</div>
          <div className="change negative">
            <XCircle size={16} /> This month
          </div>
        </div>

        <div className="stat-card late">
          <h3>Leave/Late</h3>
          <div className="value">{leaveCount + lateCount}</div>
          <div className="change">
            <Clock size={16} /> This month
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="action-bar">
        <div className="month-selector">
          <button className="month-btn" onClick={() => updateMonth(-1)} title="Previous month">
            <ChevronLeft size={18} />
          </button>
          <div className="month-display" style={{ minWidth: '180px', textAlign: 'center' }}>
            {formattedMonth}
            {!isCurrentMonth() && (
              <button 
                onClick={goToCurrentMonth}
                style={{
                  marginLeft: '10px',
                  fontSize: '12px',
                  padding: '2px 8px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer'
                }}
                title="Go to current month"
              >
                Today
              </button>
            )}
          </div>
          <button className="month-btn" onClick={() => updateMonth(1)} title="Next month">
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

      {/* Debug info (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ 
          margin: '10px', 
          padding: '10px', 
          backgroundColor: '#f0f0f0', 
          fontSize: '12px',
          borderRadius: '4px'
        }}>
          <strong>Debug Info:</strong><br />
          Total Records: {allAttendanceRecords.length} | 
          Filtered for {formattedMonth}: {attendanceRecords.length} | 
          Present: {presentCount} | 
          Absent: {absentCount} | 
          Leave/Late: {leaveCount + lateCount}
        </div>
      )}

      {/* Attendance Table */}
      <div className="attendance-container">
        {attendanceRecords.length > 0 ? (
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Subject</th>
                <th>Instructor</th>
                <th>Session Type</th>
                <th>Status</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRecords
                .sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort by date, newest first
                .map(record => (
                <tr key={record._id}>
                  <td>
                    {new Date(record.date).toLocaleDateString("en-US", {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                  <td className="subject-name">
                    {record.subject || record.classId || "N/A"}
                    {record.sessionType && <span className="tech-badge">{record.sessionType}</span>}
                  </td>
                  <td>{record.teacherName || record.teacherId || "N/A"}</td>
                  <td>{record.sessionType || "Regular"}</td>
                  <td className={`status-${record.status ? record.status.toLowerCase() : 'unknown'}`}>
                    {record.status || "N/A"}
                  </td>
                  <td>{record.note || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#666',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            margin: '20px 0'
          }}>
            <h3>No Attendance Records</h3>
            <p>No attendance records found for {formattedMonth}</p>
            {!isCurrentMonth() && (
              <button onClick={goToCurrentMonth} className="btn btn-primary" style={{ marginTop: '10px' }}>
                View Current Month
              </button>
            )}
          </div>
        )}
      </div>
      </div>
    </main>
  );
}