
import { useEffect, useState } from "react";
import { FaBook, FaClipboardCheck, FaCog, FaEnvelope, FaTachometerAlt, FaUsers } from "react-icons/fa";
import { NavLink } from "react-router";
import "./Teacher.css";

export default function TeacherSidebar() {
  const [teacher, setTeacher] = useState(null);

  useEffect(() => {
    // 🔑 Get teacherId from localStorage (set during login)
    const teacherId = localStorage.getItem("teacherId");

    if (!teacherId) {
      console.error("No teacherId found in localStorage. User not logged in?");
      return;
    }

    fetch(`http://localhost:5000/admin/teachers/${teacherId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch teacher");
        return res.json();
      })
      .then((data) => setTeacher(data))
      .catch((err) => console.error("Error fetching teacher:", err));
  }, []);

  return (
    <div className="sidebar">
      <div className="logo">
        <a href="/">Learner</a>
      </div>

      <div className="profile">
        {teacher?.TeacherIMG ? (
          <img src={teacher.TeacherIMG} alt="Profile" className="profile-img" />
        ) : (
          <div className="profile-img">
            {teacher?.FullName ? teacher.FullName.charAt(0).toUpperCase() : "?"}
          </div>
        )}
        <div className="profile-name">
          {teacher ? teacher.FullName : "Loading..."}
        </div>
        <div className="profile-role">
          {teacher ? teacher.Course || "Teacher" : ""}
        </div>
      </div>

      <NavLink to="/teachdashboard" className="nav-link">
        <FaTachometerAlt /> Dashboard
      </NavLink>
      <NavLink to="/teachprofile" className="nav-link">
        <FaUsers /> Profile
      </NavLink>
      <NavLink to="/teachclasses" className="nav-link">
        <FaBook /> My Classes
      </NavLink>
      <NavLink to="/teachattendance" className="nav-link">
        <FaClipboardCheck /> Attendance
      </NavLink>
      <NavLink to="/teachstudent" className="nav-link">
        <FaUsers /> Students
      </NavLink>
      <NavLink to="/teachannouncements" className="nav-link">
        <FaEnvelope /> Announcements
      </NavLink>
      <NavLink to="/teachresources" className="nav-link">
        <FaBook /> Resources
      </NavLink>
      <NavLink to="/teachsettings" className="nav-link">
        <FaCog /> Settings
      </NavLink>
    </div>
  );
}
