  // src/pages/AttendancePage.jsx
  import { useEffect, useState } from "react";
import "./Teacher.css";

  export default function Attendance() {
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({});

    const teacherId = localStorage.getItem("teacherId");

    // ✅ Generate weekdays (no Sat/Sun)
    const getDaysInMonth = (year, month) => {
      const days = [];
      const date = new Date(year, month, 1);

      while (date.getMonth() === month) {
        const day = date.getDay();
        if (day !== 0 && day !== 6) {
          days.push(new Date(date));
        }
        date.setDate(date.getDate() + 1);
      }
      return days;
    };

    const today = new Date();
    const days = getDaysInMonth(today.getFullYear(), today.getMonth());

    // ✅ Fetch students from backend
    useEffect(() => {
      fetch(`http://localhost:5000/by-teacher/${teacherId}`)
        .then((res) => res.json())
        .then((data) => {
          setStudents(data);

          // initialize attendance state
          const initial = {};
          data.forEach((s) => {
            initial[s._id] = {};
            days.forEach((d) => {
              const key = d.toISOString().split("T")[0];
              initial[s._id][key] = null; // null = not marked yet
            });
          });
          setAttendance(initial);
        })
        .catch((err) => console.error("Error fetching students:", err));
    }, [teacherId]);

    // ✅ Toggle Present/Absent
    const markAttendance = (studentId, dateKey, status) => {
      setAttendance((prev) => ({
        ...prev,
        [studentId]: {
          ...prev[studentId],
          [dateKey]: status,
        },
      }));
    };

    // ✅ Count totals per student
    const getTotals = (studentId) => {
      let present = 0;
      let absent = 0;
      Object.values(attendance[studentId] || {}).forEach((v) => {
        if (v === "present") present++;
        if (v === "absent") absent++;
      });
      return { present, absent };
    };

    return (
      <div className="attendance-page">
        <h2>📅 Attendance - {today.toLocaleString("default", { month: "long" })}</h2>

        <table className="attendance-table">
          <thead>
            <tr>
              <th>Student</th>
              {days.map((d) => (
                <th key={d.toISOString()}>
                  {d.getDate()}<br />
                  {d.toLocaleString("default", { weekday: "short" })}
                </th>
              ))}
              <th>Totals</th>
            </tr>
          </thead>

          <tbody>
            {students.map((student) => {
              const totals = getTotals(student._id);
              return (
                <tr key={student._id}>
                  <td>{student.fullName}</td>
                  {days.map((d) => {
                    const dateKey = d.toISOString().split("T")[0];
                    return (
                      <td key={dateKey}>
                        <label>
                          <input
                            type="checkbox"
                            checked={attendance[student._id]?.[dateKey] === "present"}
                            onChange={() =>
                              markAttendance(student._id, dateKey, "present")
                            }
                          />{" "}
                          P
                        </label>
                        <label>
                          <input
                            type="checkbox"
                            checked={attendance[student._id]?.[dateKey] === "absent"}
                            onChange={() =>
                              markAttendance(student._id, dateKey, "absent")
                            }
                          />{" "}
                          A
                        </label>
                      </td>
                    );
                  })}
                  <td>
                    P{totals.present} / A {totals.absent}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
