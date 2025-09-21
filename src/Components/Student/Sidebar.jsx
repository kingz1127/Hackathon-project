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
      </ul>
    </div>
  );
}
