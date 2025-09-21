import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar"
import styles from "./AdminDashboard.module.css";

export default function AdminDashboard() {
  return (
    <>
    
      <div className={styles.back}>
        <div>
          <Sidebar />
        </div>
        <div>
          <Outlet />
        </div>
      </div>
    </>
  );
}
