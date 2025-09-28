import { useEffect, useState } from "react";
import "./Teacher.css";

export default function Attendance() {
  const teacherId = localStorage.getItem("teacherId");
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [termLevel, setTermLevel] = useState(""); // e.g., 100, 200, 300
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 5;

  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Fetch teacher-specific students
  useEffect(() => {
    if (!teacherId) return;
    const query = termLevel ? `?termLevel=${termLevel}` : "";
    fetch(`http://localhost:5000/by-teacher/${teacherId}${query}`)
      .then((res) => res.json())
      .then((data) => setStudents(data))
      .catch((err) => console.error("Error fetching students:", err));
  }, [teacherId, termLevel]);

  // Pagination
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = students.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalPages = Math.ceil(students.length / studentsPerPage);

  // Calendar helper
  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();

  // Build attendance mapping for calendar
  const attendanceForMonth = {};
  Object.values(attendanceData).forEach((entry) => {
    if (entry.date) {
      const dateKey = entry.date.split("T")[0];
      attendanceForMonth[dateKey] = entry.status;
    }
  });

  // Save attendance function
  const saveAttendance = async () => {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const classId = "CS001-IT"; // replace with dynamic class if needed

    try {
      await Promise.all(
        Object.keys(attendanceData).map((studentId) => {
          const entry = attendanceData[studentId];
          if (!entry.status) return null; // skip if no status

          return fetch(`http://localhost:5000/attendance/student/${studentId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              studentId,
              classId,
              teacherId,
              date: today,
              status: entry.status,
              note: entry.note || ""
            })
          });
        })
      );
      alert("Attendance saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Error saving attendance");
    }
  };

  return (
    <div className="attendance-container">
      {/* LEFT SIDE */}
      <div className="left-section">
        <div className="filters-box">
          <h3>Subject Attendance</h3>
          <div className="filters">
            <select><option>Faculty of CS</option></select>
            <select><option>BSCS</option></select>
            <select><option>FALL 22</option></select>
            <select value={termLevel} onChange={(e) => setTermLevel(e.target.value)}>
              <option value="">All Terms</option>
              <option value="100">100 Level</option>
              <option value="200">200 Level</option>
              <option value="300">300 Level</option>
            </select>
            <button>Search</button>
          </div>
        </div>

        <div className="table-box">
          <table>
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Present</th>
                <th>Absent</th>
                <th>Leave</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
             {currentStudents.map((student) => (
     <tr key={student.studentId}>
       <td>{student.studentId}</td>
       <td>{student.fullName}</td>

                  {["present", "absent", "leave"].map((statusType) => (
                    <td key={statusType}>
                      <input
                        type="radio"
                        name={`status-${student.studentId}`}
                        checked={attendanceData[student.studentId]?.status === statusType}
                        onChange={() =>
                          setAttendanceData((prev) => ({
                            ...prev,
                            [student.studentId]: {
                              ...prev[student.studentId],
                              status: statusType,
                              date: new Date().toISOString()
                            }
                          }))
                        }
                      />
                    </td>
                  ))}

                  <td>
                    <input
                      className="attendance-note-input"
                      type="text"
                      placeholder="Add note"
                      value={attendanceData[student.studentId]?.note || ""}
                      onChange={(e) =>
                        setAttendanceData((prev) => ({
                          ...prev,
                          [student.studentId]: {
                            ...prev[student.studentId],
                            note: e.target.value,
                            date: new Date().toISOString()
                          }
                        }))
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button className="save-attendance-btn" onClick={saveAttendance}>
            Save Attendance
          </button>

          <div className="pagination">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Prev
            </button>
            <span>{currentPage} / {totalPages}</span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="right-section">
        {/* Calendar */}
        <div className="calendar-box">
          <h3>
            {new Date(currentYear, currentMonth).toLocaleString("default", { month: "long" })} {currentYear}
          </h3>
          <div className="calendar">
            {[...Array(getDaysInMonth(currentMonth, currentYear))].map((_, i) => {
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`;
              const status = attendanceForMonth[dateStr];

              return (
                <div
                  key={i}
                  className={`day ${status ? status : ""}`}
                  title={status ? status.toUpperCase() : ""}
                >
                  {i + 1}
                </div>
              );
            })}
          </div>
        </div>

        {/* Totals */}
        <div className="totals-box">
          <div className="total yellow">{students.length} Total Students</div>
          <div className="total green">
            {Object.values(attendanceData).filter(a => a.status === "present").length} Present Today
          </div>
          <div className="total red">
            {Object.values(attendanceData).filter(a => a.status === "absent").length} Absent Today
          </div>
        </div>
      </div>
    </div>
  );
}
