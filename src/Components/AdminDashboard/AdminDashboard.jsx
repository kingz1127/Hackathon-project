import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar"
import styles from "./AdminDashboard.module.css";

export default function AdminDashboard() {
  return (
    <>
    
      <div className={styles.back}>
        <div className={styles.side}>
          <Sidebar />
        </div>
        <div className={styles.out}>
          <Outlet />
        </div>
      </div>
    </>
  );
}
