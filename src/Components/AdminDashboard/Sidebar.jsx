import { IoIosNotifications } from "react-icons/io"; 
import { GiMoneyStack } from "react-icons/gi"; 
import { useState, useEffect } from "react";
import { FaBook, FaCog, FaEnvelope, FaTachometerAlt, FaUsers, FaSignOutAlt } from "react-icons/fa";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import styles from "./Sidebar.module.css";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Handle logout
  const handleLogout = () => {
    // In a real app, you might clear authentication tokens or user data here
    console.log("Logging out...");
    
    // Redirect to the learner page
    navigate("/login");
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
        <NavLink 
          to="admindashboard1" 
          className={({ isActive }) => 
            isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
          }
        >
          <div className={styles.navContent}>
            <FaTachometerAlt className={styles.navIcon} />
            <span className={styles.navText}>Dashboard</span>
          </div>
          <div className={styles.activeIndicator}></div>
        </NavLink>
        
        <NavLink 
          to="adminteacher" 
          className={({ isActive }) => 
            isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
          }
        >
          <div className={styles.navContent}>
            <FaUsers className={styles.navIcon} />
            <span className={styles.navText}>Teachers</span>
          </div>
          <div className={styles.activeIndicator}></div>
        </NavLink>
        
        <NavLink 
          to="adminstudent" 
          className={({ isActive }) => 
            isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
          }
        >
          <div className={styles.navContent}>
            <FaBook className={styles.navIcon} />
            <span className={styles.navText}>Students</span>
          </div>
          <div className={styles.activeIndicator}></div>
        </NavLink>

        <NavLink 
          to="adminmessages" 
          className={({ isActive }) => 
            isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
          }
        >
          <div className={styles.navContent}>
            <FaEnvelope className={styles.navIcon} />
            <span className={styles.navText}>Event</span>
          </div>
          <div className={styles.activeIndicator}></div>
        </NavLink>

        <NavLink 
          to="adminFinance" 
          className={({ isActive }) => 
            isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
          }
        >
          <div className={styles.navContent}>
            <GiMoneyStack  className={styles.navIcon} />
            <span className={styles.navText}>Finance</span>
          </div>
          <div className={styles.activeIndicator}></div>
        </NavLink>

         <NavLink 
          to="adminNotify" 
          className={({ isActive }) => 
            isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
          }
        >
          <div className={styles.navContent}>
            <IoIosNotifications  className={styles.navIcon} />
            <span className={styles.navText}>Notifications</span>
          </div>
          <div className={styles.activeIndicator}></div>
        </NavLink>

        
        
        <NavLink 
          to="adminSettings" 
          className={({ isActive }) => 
            isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
          }
        >
          <div className={styles.navContent}>
            <FaCog className={styles.navIcon} />
            <span className={styles.navText}>Settings</span>
          </div>
          <div className={styles.activeIndicator}></div>
        </NavLink>
      </nav>

      

      {/* Logout Button */}
      <div className={styles.logoutSection}>
        <button className={styles.logoutButton} onClick={handleLogout}>
          <FaSignOutAlt className={styles.logoutIcon} />
          <span className={styles.logoutText}>Log Out</span>
        </button>
      </div>
    </div>
  );
}