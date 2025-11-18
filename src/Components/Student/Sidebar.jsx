

import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

export default function Sidebar() {
  const [student, setStudent] = useState(null);

  useEffect(() => {
    const studentId = localStorage.getItem("studentId");
    if (!studentId) return;

    fetch(`http://localhost:5000/admin/students/${studentId}`)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => setStudent(data))
      .catch((err) => console.error("Failed to fetch student:", err));
  }, []);

  return (
    <div className="sidebar">
      <h2 className="logo">Learner</h2>

      {/* Student profile */}
      {student ? (
        <div className="student-profile">
          <img
            src={student.studentImg || "/default-avatar.png"}
            alt={student.fullName}
            className="student-avatar"
          />
          {/* <p className="student-name">{student.fullName}</p> */}
        </div>
      ) : (
        <div className="student-profile">
          <img
            src="/default-avatar.png"
            alt="loading..."
            className="student-avatar"
          />
          <p className="student-name">Loading...</p>
        </div>
      )}

      {/* Sidebar Navigation */}
      <ul>
        <li>
          <NavLink
            to="/student"
            className={({ isActive }) =>
              isActive ? "sidebar-btn active" : "sidebar-btn"
            }
          >
            <span className="icon">🏠</span> Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink
            to="studentcourses"
            className={({ isActive }) =>
              isActive ? "sidebar-btn active" : "sidebar-btn"
            }
          >
            <span className="icon">📚</span> Courses
          </NavLink>
        </li>
        <li>
          <NavLink
            to="studentassignments"
            className={({ isActive }) =>
              isActive ? "sidebar-btn active" : "sidebar-btn"
            }
          >
            <span className="icon">📝</span> Assignments
          </NavLink>
        </li>
        <li>
          <NavLink
            to="studentgrades"
            className={({ isActive }) =>
              isActive ? "sidebar-btn active" : "sidebar-btn"
            }
          >
            <span className="icon">📊</span> Grades
          </NavLink>
        </li>
        <li>
          <NavLink
            to="studentattendance"
            className={({ isActive }) =>
              isActive ? "sidebar-btn active" : "sidebar-btn"
            }
          >
            <span className="icon">✅</span> Attendance
          </NavLink>
        </li>

        <li>
          <NavLink
            to="studentFinance"
            className={({ isActive }) =>
              isActive ? "sidebar-btn active" : "sidebar-btn"
            }
          >
            <span className="icon">💵</span> Finance
          </NavLink>
        </li>
        
        <li>
          <NavLink
            to="studentresources"
            className={({ isActive }) =>
              isActive ? "sidebar-btn active" : "sidebar-btn"
            }
          >
            <span className="icon">📥</span> Resources
          </NavLink>
        </li>
        <li>
          <NavLink to="studentAnnoucement" className={({ isActive }) =>
              isActive ? "sidebar-btn active" : "sidebar-btn"
            }
          >
            <span className="icon">📢</span> Annoucements
          </NavLink>
        </li>
        <li>
          <NavLink
            to="studentsettings"
            className={({ isActive }) =>
              isActive ? "sidebar-btn active" : "sidebar-btn"
            }
          >
            <span className="icon">⚙️</span> Settings
          </NavLink>
        </li>
      </ul>
    </div>
  );
}
