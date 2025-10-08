
import { Outlet } from "react-router-dom";
import FloatingWidget from "./components/FloatingWidget.jsx";
import Sidebar from "./Sidebar.jsx";
import "./StudentDashboard.css";

export default function StudentDashboard() {
  return (
    <div className="student-dashboard">
      <Sidebar />
      <div className="student-main">
        <Outlet />
      </div>
      <FloatingWidget />
    </div>
  );
}
