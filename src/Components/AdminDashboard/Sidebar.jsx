import { FaBook, FaClipboardCheck, FaCog, FaEnvelope, FaTachometerAlt, FaUsers } from "react-icons/fa";
import { NavLink, useLocation } from "react-router-dom";
import styles from "./Sidebar.module.css";

export default function Sidebar() {
  const location = useLocation();
  
  // Check if a link is active
  const isActive = (path) => {
    const currentPath = location.pathname.replace(/\/$/, "");
    const comparePath = path.replace(/\/$/, "");
    return currentPath === comparePath || currentPath.startsWith(comparePath + "/");
  };

  return (
    <div className={styles.sidebar}>
      {/* Logo Section */}
      <div className={styles.logo}>
        <a href="/" className={styles.logoLink}>
          <span className={styles.logoText}>Learner</span>
          
        </a>
      </div>

      {/* Navigation Links */}
      <nav className={styles.navContainer}>
        <div className={styles.navSection}>
          
        </div>
        
        <NavLink 
          to="admindashboard1" 
          className={isActive("/admindashboard1") ? `${styles.navLink} ${styles.active}` : styles.navLink}
        >
          <FaTachometerAlt className={styles.navIcon} />
          <span className={styles.navText}>Dashboard</span>
        </NavLink>
        
        <NavLink 
          to="adminteacher" 
          className={isActive("/adminteacher") ? `${styles.navLink} ${styles.active}` : styles.navLink}
        >
          <FaUsers className={styles.navIcon} />
          <span className={styles.navText}>Teachers</span>
        </NavLink>
        
        <NavLink 
          to="adminstudent" 
          className={isActive("/adminstudent") ? `${styles.navLink} ${styles.active}` : styles.navLink}
        >
          <FaBook className={styles.navIcon} />
          <span className={styles.navText}>Students</span>
        </NavLink>

      
        
        <NavLink 
          to="/adminmessages" 
          className={isActive("/adminmessages") ? `${styles.navLink} ${styles.active}` : styles.navLink}
        >
          <FaEnvelope className={styles.navIcon} />
          <span className={styles.navText}>Event</span>
        </NavLink>
        
        <NavLink 
          to="/adminsettings" 
          className={isActive("/adminsettings") ? `${styles.navLink} ${styles.active}` : styles.navLink}
        >
          <FaCog className={styles.navIcon} />
          <span className={styles.navText}>Settings</span>
        </NavLink>
      </nav>

      {/* User Profile Section */}
      <div className={styles.userSection}>
        <div className={styles.userInfo}>
          <div className={styles.userAvatar}>
            <img 
              src="https://via.placeholder.com/40" 
              alt="Admin User" 
              className={styles.avatarImage}
            />
          </div>
          <div className={styles.userDetails}>
            <p className={styles.userName}>Admin User</p>
            <p className={styles.userRole}>Administrator</p>
          </div>
        </div>
      </div>
    </div>
  );
}