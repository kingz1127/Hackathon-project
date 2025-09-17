import { Link } from "react-router-dom";
import styles from "./Sidebar.module.css";

export default function Sidebar() {
  return (
    <>
      <div className={styles.sidebarAdmin}>
        <Link to="admindashboard1">Dashboard</Link>
        <Link to="adminstudent">Students</Link>
        <Link to="adminteacher">Teachers</Link>
      </div>
    </>
  );
}
3