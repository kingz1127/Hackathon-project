// src/pages/Attendance.jsx
import { useState } from "react";
import "../Styles/Teacher.css";

export default function Attendance() {
  const [date, setDate] = useState("");
  const [students, setStudents] = useState([
    { id: 1, name: "Jude Opeuh", present: false },
    { id: 2, name: "Dolly P", present: false },
    { id: 3, name: "Deji Man", present: false },
    { id: 4, name: "Idan", present: false },
    { id: 5, name: "Giving Giving", present: false },
  ]);

  const toggleAttendance = (id) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, present: !s.present } : s
      )
    );
  };

  const handleSave = () => {
    console.log("Attendance saved:", { date, students });
    alert("Attendance has been saved!");
  };

  return (
    <div className="attendance-page">
      <h2>📋 Attendance</h2>

      <div className="attendance-controls">
        <label>Select Date: </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <table className="attendance-table">
        <thead>
          <tr>
            <th>Student</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id}>
              <td>{student.name}</td>
              <td>
                <input
                  type="checkbox"
                  checked={student.present}
                  onChange={() => toggleAttendance(student.id)}
                />
                {student.present ? " Present" : " Absent"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className="save-btn" onClick={handleSave}>
        Save Attendance
      </button>
    </div>
  );
}
