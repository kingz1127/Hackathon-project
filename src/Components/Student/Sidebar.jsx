<<<<<<< HEAD
// import React from "react";
// import "./Sidebar.css";

// const sidebarItems = [
//   { name: "Dashboard", icon: "🏠" },
//   { name: "Courses", icon: "📚" },
//   { name: "Assignments", icon: "📝" },
//   { name: "Schedule", icon: "📅" },
//   { name: "Grades", icon: "📊" },
//   { name: "Attendance", icon: "✅" },
//   { name: "Resources", icon: "📥" },
//   { name: "Settings", icon: "⚙️" },
// ];

// export default function Sidebar({ active, setActive }) {
//   return (
//     <div className="sidebar">
//       <h2 className="logo">Learner</h2>
//       <ul>
//         {sidebarItems.map((item) => (
//           <li key={item.name}>
//             <button
//               className={`sidebar-btn${active === item.name ? " active" : ""}`}
//               onClick={() => setActive(item.name)}
//               style={{
//                 fontSize: "1.5rem",
//                 fontWeight: "bold",
//                 width: "7rem",
//                 background: "none",
//                 border: "none",
//                 color: "inherit",
//                 textAlign: "left",
//                 padding: "10px",
//                 borderRadius: "8px",
//                 cursor: "pointer",
//                 position: "relative",
//                 display: "flex",
//                 alignSelf: "left",
//                 marginLeft: "-4rem",
//                 gap: "12px",
//               }}
//             >
//               <span style={{ fontSize: "1.8rem" }}>{item.icon}</span>
//               {item.name}
//             </button>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

export default function Sidebar() {
=======
import { useEffect, useState } from "react";
import "./Sidebar.css";

const sidebarItems = [
  { name: "Dashboard", icon: "🏠" },
  { name: "Courses", icon: "📚" },
  { name: "Assignments", icon: "📝" },
  { name: "Schedule", icon: "📅" },
  { name: "Grades", icon: "📊" },
  { name: "Attendance", icon: "✅" },
  { name: "Resources", icon: "📥" },
  { name: "Settings", icon: "⚙️" },
];

export default function Sidebar({ active, setActive }) {
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

>>>>>>> 6d33fb6325552021e62683185db0b9d24b47a150
  return (
    <div className="sidebar">
      <h2 className="logo">Learner</h2>

      {student ? (
        <div className="student-profile">
          <img
            src={student.studentImg || "/default-avatar.png"}
            alt={student.fullName}
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              objectFit: "cover",
             
            }}
          />
          {/* <p style={{ fontWeight: "bold" }}>{student.fullName}</p> */}
        </div>
      ) : (
        <div className="student-profile">
          <img
            src="/default-avatar.png"
            alt="loading..."
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              objectFit: "cover",
              
            }}
          />
          <p style={{ fontWeight: "bold" }}>Loading...</p>
        </div>
      )}

      <ul>
<<<<<<< HEAD
        <li>
          <NavLink to="/student" className={({ isActive }) => isActive ? "sidebar-btn active" : "sidebar-btn"}>
            <span className="icon">🏠</span> Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/student/studentcourses" className={({ isActive }) => isActive ? "sidebar-btn active" : "sidebar-btn"}>
            <span className="icon">📚</span> Courses
          </NavLink>
        </li>
        <li>
          <NavLink to="/student/studentassignments" className={({ isActive }) => isActive ? "sidebar-btn active" : "sidebar-btn"}>
            <span className="icon">📝</span> Assignments
          </NavLink>
        </li>
        {/* <li>rss */}
          {/* <NavLink to="/student/studentschedule" className={({ isActive }) => isActive ? "sidebar-btn active" : "sidebar-btn"}>
            <span className="icon">📅</span> Schedule
          </NavLink>
        </li> */}
        <li>
          <NavLink to="/student/studentgrades" className={({ isActive }) => isActive ? "sidebar-btn active" : "sidebar-btn"}>
            <span className="icon">📊</span> Grades
          </NavLink>
        </li>
        <li>
          <NavLink to="/student/studentattendance" className={({ isActive }) => isActive ? "sidebar-btn active" : "sidebar-btn"}>
            <span className="icon">✅</span> Attendance
          </NavLink>
        </li>
        <li>
          <NavLink to="/student/studentresources" className={({ isActive }) => isActive ? "sidebar-btn active" : "sidebar-btn"}>
            <span className="icon">📥</span> Resources
          </NavLink>
        </li>
        <li>
          <NavLink to="/student/studentsettings" className={({ isActive }) => isActive ? "sidebar-btn active" : "sidebar-btn"}>
            <span className="icon">⚙️</span> Settings
          </NavLink>
        </li>
=======
        {sidebarItems.map((item) => (
          <li key={item.name}>
            <button
              className={`sidebar-btn${active === item.name ? " active" : ""}`}
              onClick={() => setActive(item.name)}
            >
              <span style={{ fontSize: "1.8rem" }}>{item.icon}</span>
              {item.name}
            </button>
          </li>
        ))}
>>>>>>> 6d33fb6325552021e62683185db0b9d24b47a150
      </ul>
    </div>
  );
}
