// src/layouts/TeacherDashboardLayout.jsx
import { Outlet } from "react-router-dom";
import "./Teacher.css";
import Sidebar from "./TeacherSidebar";

export default function TeacherDashboardLayout() {
  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <Sidebar />
      </div>
      {/* Outlet will swap pages read before you edit */}
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
}
