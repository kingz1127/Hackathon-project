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
       <div><p> <FaTachometerAlt /></p> <p>Dashboard</p></div>
      </NavLink>
      
      <NavLink to="/teachprofile" className="nav-link">
        <div><p> <FaUsers /></p> <p>Profile</p></div>
      </NavLink>

      <NavLink to="/teachclasses" className="nav-link">
      <div><p> <FaBook /></p> <p>My Classes</p></div>   
      </NavLink>

      <NavLink to="/teachattendance" className="nav-link">
      <div><p> <FaClipboardCheck /></p> <p>Attendance</p></div>
      </NavLink>

      <NavLink to="/teachstudent" className="nav-link">
      <div><p> <FaUsers /> </p> <p>Students</p></div>
      </NavLink>

      <NavLink to="/teachannouncements" className="nav-link">
      <div><p><FaEnvelope /></p> <p>Announcements</p></div>      
      </NavLink>

      <NavLink to="/teachresources" className="nav-link">
      <div><p> <FaBook /></p> <p>Resources</p></div>       
      </NavLink>

      <NavLink to="/teachsettings" className="nav-link">
      <div><p> <FaCog /></p> <p>Settings</p></div>
      </NavLink>
    </div>
  );
}