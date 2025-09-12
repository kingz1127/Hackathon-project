// src/layouts/TeacherDashboardLayout.jsx
import { Outlet } from "react-router-dom";
import "../styles/teacher.css";
import Sidebar from "./TeacherSidebar";

export default function TeacherDashboardLayout() {
  return (
    <div className="dashboard-container">
      {/* Sidebar stays fixed */}
      <Sidebar />

      {/* Outlet will swap pages read before you edit */}
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
}
