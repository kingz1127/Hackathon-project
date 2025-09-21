import React, { useEffect, useState } from 'react';

// Navigation Button Component with hover effects
function NavButton({ icon, title, onClick }) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <button
      style={{
        ...styles.navButton,
        ...(isHovered ? styles.navButtonHover : {})
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div style={styles.navButtonIcon}>{icon}</div>
      <div style={styles.navButtonTitle}>{title}</div>
    </button>
  ); 
}

// Profile Icon Component
function ProfileIcon({ course = "Full Stack Development", semester = "Semester 3", notifications = [], setActive }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [studentName, setStudentName] = useState("Loading...");
  const [studentImg, setStudentImg] = useState(null);

  useEffect(() => {
    const studentId = localStorage.getItem("studentId"); // get saved studentId from login
    if (!studentId) return;

    fetch(`http://localhost:5000/api/students/${studentId}`)
      .then((res) => res.json())
      .then((data) => {
        setStudentName(data.fullName || "Unknown Student");
        setStudentImg(data.studentImg || null);
      })
      .catch((err) => {
        console.error("Error fetching student:", err);
        setStudentName("Error loading student");
      });
  }, []);

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleSignOut = () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      localStorage.clear();
      alert("You have been signed out successfully!");
      setActive("Landing");
    }
  };

  const handleNotifications = () => {
    setShowNotifications(!showNotifications);
    setIsDropdownOpen(false);
  };

  const handleSettings = () => {
    setActive("Settings");
    setIsDropdownOpen(false);
  };

  const markAsRead = (id) => {
    console.log(`Marking notification ${id} as read`);
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div style={styles.profileContainer}>
      {/* Welcome Message */}
      {/* <div style={styles.welcome}>
        Welcome back, {studentName}
      </div> */}

      {/* Profile Info */}
      <div style={styles.profileInfo}>
        <span style={styles.gradeClass}>
          {course} - {semester}
        </span>
      </div>

      {/* Profile Avatar / Dropdown */}
      <div
        style={styles.profileIcon}
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        <div style={styles.profileAvatar}>
          {studentImg ? (
            <img
              src={studentImg}
              alt="profile"
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          ) : (
            getInitials(studentName)
          )}
        </div>
        {unreadCount > 0 && (
          <div style={styles.notificationBadge}>{unreadCount}</div>
        )}
        {isDropdownOpen && (
          <div style={styles.dropdown}>
            <div style={styles.dropdownItem} onClick={handleNotifications}>
              Notifications{" "}
              {unreadCount > 0 && (
                <span style={styles.badgeInline}>({unreadCount})</span>
              )}
            </div>
            <div style={styles.dropdownItem} onClick={handleSettings}>
              Settings
            </div>
            <div
              style={{ ...styles.dropdownItem, ...styles.signOutItem }}
              onClick={handleSignOut}
            >
              Sign Out
            </div>
          </div>
        )}
      </div>

      {/* Notification Panel */}
      {showNotifications && (
        <div style={styles.notificationPanel}>
          <div style={styles.notificationHeader}>
            <h3 style={styles.notificationTitle}>Notifications</h3>
            <button
              style={styles.closeBtn}
              onClick={() => setShowNotifications(false)}
            >
              ×
            </button>
          </div>
          <div style={styles.notificationsList}>
            {notifications.length === 0 ? (
              <div style={styles.noNotifications}>No new notifications</div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  style={{
                    ...styles.notificationItem,
                    ...(notification.isRead ? {} : styles.unreadNotification),
                  }}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div style={styles.notificationSender}>
                    <span style={styles.senderIcon}>
                      {notification.type === "admin" ? "👨‍💼" : "👨‍🏫"}
                    </span>
                    <span style={styles.senderName}>
                      {notification.sender}
                    </span>
                    <span style={styles.notificationTime}>
                      {notification.time}
                    </span>
                  </div>
                  <div style={styles.notificationMessage}>
                    {notification.message}
                  </div>
                  {!notification.isRead && (
                    <div style={styles.unreadDot}></div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// export default ProfileIcon;


export default function Dashboard({ setActive }) {
  const [isClassesExpanded, setIsClassesExpanded] = React.useState(false);
  const [isScheduleExpanded, setIsScheduleExpanded] = React.useState(false);
  const [isAssignmentsExpanded, setIsAssignmentsExpanded] = React.useState(false);

  // New states for student
  const [studentName, setStudentName] = React.useState("Loading...");
  const [studentImg, setStudentImg] = React.useState(null);

  // Fetch student info (same logic as Sidebar)
  React.useEffect(() => {
    const studentId = localStorage.getItem("studentId");
    if (!studentId) return;

    fetch(`http://localhost:5000/admin/students/${studentId}`)
  .then((res) => res.json())
  .then((data) => {
    setStudentName(data.fullName || "Unknown Student");
    setStudentImg(data.studentImg || null);
  })
  .catch((err) => {
    console.error("Error fetching student:", err);
    setStudentName("Error loading student");
  });
  }, []);
  
  // Sample notifications - in real app, this would come from API
  const [notifications] = React.useState([
    {
      id: 1,
      sender: "Admin Office",
      type: "admin",
      message: "Important: Campus will be closed on Friday for maintenance. All classes moved online.",
      time: "2 hours ago",
      isRead: false
    },
    {
      id: 2,
      sender: "Dr. Johnson",
      type: "teacher",
      message: "Assignment deadline extended for React E-commerce project to next Monday.",
      time: "4 hours ago",
      isRead: false
    },
    {
      id: 3,
      sender: "Ms. Chen",
      type: "teacher",
      message: "Great job on your Web Development presentation! Please see me after class for feedback.",
      time: "1 day ago",
      isRead: true
    },
    {
      id: 4,
      sender: "Admin Office",
      type: "admin",
      message: "New course materials available in the Resource Library. Check out the latest industry guides.",
      time: "2 days ago",
      isRead: false
    },
    {
      id: 5,
      sender: "Prof. Williams",
      type: "teacher",
      message: "Software Architecture exam scheduled for next week. Review chapters 5-8.",
      time: "3 days ago",
      isRead: true
    }
  ]);
  
  const statsCards = [
    {
      title: "Overall Grade Average",
      value: "87.5%",
      change: "2.3% from last term",
      color: "#10b981"
    },
    {
      title: "Attendance Rate", 
      value: "90%",
      change: "Perfect this month",
      color: "#10b981"
    },
    {
      title: "Pending Assignments",
      value: "3",
      change: "2 due this week", 
      color: "#ef4444"
    },
    {
      title: "Next Class",
      value: "React",
      change: "Class in progress",
      color: "#6366f1"
    }
  ];

  const schedule = [
    { time: "8:00 - 9:00", subject: "Data Structures", teacher: "Dr. Johnson" },
    { time: "9:15 - 10:15", subject: "Web Development", teacher: "Ms. Chen" },
    { time: "10:30 - 11:30", subject: "Software Architecture", teacher: "Prof. Williams" },
    { time: "12:00 - 1:00", subject: "Database Systems", teacher: "Dr. Martinez" },
    { time: "1:15 - 2:15", subject: "DevOps & CI/CD", teacher: "Mr. Anderson" }
  ];

  const extendedSchedule = [
    ...schedule,
    { time: "2:30 - 3:30", subject: "Machine Learning", teacher: "Dr. Kim" },
    { time: "3:45 - 4:45", subject: "System Security", teacher: "Prof. Taylor" },
    { time: "5:00 - 6:00", subject: "Code Review Session", teacher: "Mr. Brown" }
  ];

  const assignments = [
    {
      title: "React E-commerce Platform",
      subtitle: "Full-stack application with payment integration",
      dueDate: "Tomorrow",
      icon: "💻"
    },
    {
      title: "REST API Development", 
      subtitle: "Build RESTful API with Node.js and Express",
      dueDate: "2 days",
      icon: "🔧"
    },
    {
      title: "Cloud Deployment Project",
      subtitle: "Deploy microservices on AWS with Docker", 
      dueDate: "5 days",
      icon: "☁️"
    },
    {
      title: "Code Review & Testing",
      subtitle: "Unit testing and peer code review assignment",
      dueDate: "1 week", 
      icon: "🧪"
    }
  ];

  const extendedAssignments = [
    ...assignments,
    {
      title: "GraphQL API Implementation",
      subtitle: "Build GraphQL server with Apollo and MongoDB",
      dueDate: "2 weeks",
      icon: "🔗"
    },
    {
      title: "Blockchain Smart Contract",
      subtitle: "Develop Ethereum smart contract with Solidity",
      dueDate: "3 weeks",
      icon: "⛓️"
    },
    {
      title: "AI Chatbot Integration",
      subtitle: "Integrate OpenAI API into existing application",
      dueDate: "1 month",
      icon: "🤖"
    }
  ];

  return (
    <div style={styles.fullContainer}>
      <div style={styles.container}>
        {/* Header with Profile */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Student Dashboard</h1>
            {/* ✅ Now fetching from DB instead of prop */}
            <div style={styles.welcome}>Welcome back, {studentName}</div>
          </div>
          <ProfileIcon 
            course="Full Stack Development"
            semester="Semester 3"
            studentName={studentName}
            studentImg={studentImg}
            notifications={notifications}
            setActive={setActive}
          />
        </div>
        

        {/* Main Content */}
        <div style={styles.mainGrid}>
          {/* Today's Schedule */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>Today's Schedule</h2>
              <button 
                style={styles.expandBtn}
                onClick={() => setIsScheduleExpanded(!isScheduleExpanded)}
              >
                {isScheduleExpanded ? '−' : '+'}
              </button>
            </div>
            <div style={styles.scheduleTable}>
              <div style={styles.tableHeader}>
                <div style={styles.headerCell}>Time</div>
                <div style={styles.headerCell}>Subject</div>
                <div style={styles.headerCell}>Teacher</div>
              </div>
              <div style={{
                maxHeight: isScheduleExpanded ? '400px' : '250px',
                overflow: 'hidden',
                transition: 'max-height 0.3s ease'
              }}>
                {(isScheduleExpanded ? extendedSchedule : schedule).map((item, index) => (
                  <div key={index} style={styles.tableRow}>
                    <div style={styles.cell}>{item.time}</div>
                    <div style={styles.cell}>{item.subject}</div>
                    <div style={styles.cell}>{item.teacher}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Upcoming Assignments */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>Upcoming Assignments</h2>
              <button 
                style={styles.expandBtn}
                onClick={() => setIsAssignmentsExpanded(!isAssignmentsExpanded)}
              >
                {isAssignmentsExpanded ? '−' : '+'}
              </button>
            </div>
            <div style={{
              ...styles.assignmentsList,
              maxHeight: isAssignmentsExpanded ? '400px' : '280px',
              overflow: 'hidden',
              transition: 'max-height 0.3s ease'
            }}>
              {(isAssignmentsExpanded ? extendedAssignments : assignments).map((assignment, index) => (
                <div key={index} style={styles.assignmentItem}>
                  <div style={styles.assignmentIcon}>{assignment.icon}</div>
                  <div style={styles.assignmentContent}>
                    <div style={styles.assignmentTitle}>{assignment.title}</div>
                    <div style={styles.assignmentSubtitle}>{assignment.subtitle}</div>
                  </div>
                  <div style={styles.assignmentDue}>{assignment.dueDate}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Classes Card */}
        <div style={styles.upcomingClassesCard}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>Upcoming Classes</h2>
            <button 
              style={styles.expandBtn}
              onClick={() => setIsClassesExpanded(!isClassesExpanded)}
            >
              {isClassesExpanded ? '−' : '+'}
            </button>
          </div>
          <div style={{
            ...styles.upcomingClassesList,
            maxHeight: isClassesExpanded ? '400px' : '200px',
            overflow: 'hidden',
            transition: 'max-height 0.3s ease'
          }}>
            <div style={styles.classItem}>
              <div style={styles.classTime}>Now - 9:00</div>
              <div style={styles.classDetails}>
                <div style={styles.className}>Algorithm Design</div>
                <div style={styles.classRoom}>Lab 205 - Advanced Data Structures & Algorithms</div>
              </div>
            </div>
            <div style={styles.classItem}>
              <div style={styles.classTime}>9:15 - 10:15</div>
              <div style={styles.classDetails}>
                <div style={styles.className}>Full-Stack Development</div>
                <div style={styles.classRoom}>Lab 3 - React & Node.js Workshop</div>
              </div>
            </div>
            <div style={styles.classItem}>
              <div style={styles.classTime}>10:30 - 11:30</div>
              <div style={styles.classDetails}>
                <div style={styles.className}>Software Architecture</div>
                <div style={styles.classRoom}>Room 112 - Design Patterns & System Design</div>
              </div>
            </div>
            {isClassesExpanded && (
              <>
                <div style={styles.classItem}>
                  <div style={styles.classTime}>12:00 - 1:00</div>
                  <div style={styles.classDetails}>
                    <div style={styles.className}>DevOps & Cloud</div>
                    <div style={styles.classRoom}>Lab 4 - Docker, Kubernetes & AWS</div>
                  </div>
                </div>
                <div style={styles.classItem}>
                  <div style={styles.classTime}>1:15 - 2:15</div>
                  <div style={styles.classDetails}>
                    <div style={styles.className}>Mobile Development</div>
                    <div style={styles.classRoom}>Lab 6 - React Native & Flutter</div>
                  </div>
                </div>
                <div style={styles.classItem}>
                  <div style={styles.classTime}>2:30 - 3:30</div>
                  <div style={styles.classDetails}>
                    <div style={styles.className}>Database Optimization</div>
                    <div style={styles.classRoom}>Room 201 - SQL Performance & NoSQL</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div style={styles.navButtonsGrid}>
          <NavButton icon="📚" title="View Courses" onClick={() => setActive("Courses")} />
          <NavButton icon="📝" title="Assignments" onClick={() => setActive("Assignments")} />
          <NavButton icon="📊" title="Check Grades" onClick={() => setActive("Grades")} />
          <NavButton icon="📅" title="View Schedule" onClick={() => setActive("Schedule")} />
          <NavButton icon="📥" title="Resources" onClick={() => setActive("Resources")} />
          <NavButton icon="💬" title="Message Teacher" onClick={() => setActive("Settings")} />
        </div>
      </div>
    </div>
  );
}

const styles = {
  fullContainer: {
    minHeight: '100vh',
    width: '100%',
    backgroundColor: '#f8fafc'
  },
  container: {
    padding: '20px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    width: '100%',
    '@media (max-width: 768px)': {
      padding: '10px'
    }
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '2rem',
    '@media (max-width: 768px)': {
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      gap: '1rem',
      marginBottom: '1rem'
    }
  },
  title: {
    color: "#0a174e",
    fontWeight: "bold",
    fontSize: "3rem",
    padding: "3rem",
    marginBottom: "0.5rem",
    margin: 0,
    '@media (max-width: 1024px)': {
      fontSize: '2.5rem',
      padding: '2rem'
    },
    '@media (max-width: 768px)': {
      fontSize: '2rem',
      padding: '1rem'
    },
    '@media (max-width: 480px)': {
      fontSize: '1.5rem',
      padding: '0.5rem'
    }
  },
  welcome: {
    color: "#333",
    fontSize: "1.5rem",
    fontWeight: "500",
    padding:"3rem",
    marginTop: "-6rem",
    marginBottom: "2rem",
    '@media (max-width: 1024px)': {
      fontSize: '1.3rem',
      padding: '2rem',
      marginTop: '-4rem'
    },
    '@media (max-width: 768px)': {
      fontSize: '1.1rem',
      padding: '1rem',
      marginTop: '-2rem',
      marginBottom: '0'
    },
    '@media (max-width: 480px)': {
      fontSize: '1rem',
      padding: '0.5rem'
    }
  },
  profileContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '20px',
    position: 'relative'
  },
  profileInfo: {
    textAlign: 'right'
  },
  gradeClass: {
    fontSize: '14px',
    color: '#64748b',
    fontWeight: '500'
  },
  profileIcon: {
    position: 'relative',
    cursor: 'pointer'
  },
  profileAvatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: '#3b82f6',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    fontSize: '16px',
    border: '2px solid #e2e8f0',
    transition: 'all 0.2s ease',
    ':hover': {
      transform: 'scale(1.05)',
      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
    }
  },
  dropdown: {
    position: 'absolute',
    top: '60px',
    right: '0',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    border: '1px solid #e2e8f0',
    minWidth: '160px',
    zIndex: 1000
  },
  dropdownItem: {
    padding: '12px 16px',
    fontSize: '14px',
    color: '#374151',
    cursor: 'pointer',
    borderBottom: '1px solid #f3f4f6',
    transition: 'background-color 0.2s ease',
    ':hover': {
      backgroundColor: '#f9fafb'
    }
  },
  signOutItem: {
    color: '#ef4444',
    borderBottom: 'none',
    fontWeight: '500'
  },
  notificationBadge: {
    position: 'absolute',
    top: '-2px',
    right: '-2px',
    backgroundColor: '#ef4444',
    color: 'white',
    fontSize: '10px',
    fontWeight: 'bold',
    borderRadius: '50%',
    width: '18px',
    height: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid white'
  },
  badgeInline: {
    color: '#ef4444',
    fontWeight: '600'
  },
  notificationPanel: {
    position: 'absolute',
    top: '80px',
    right: '20px',
    width: '400px',
    maxHeight: '500px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
    border: '1px solid #e2e8f0',
    zIndex: 1001,
    overflow: 'hidden'
  },
  notificationHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc'
  },
  notificationTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '600',
    color: '#1e293b'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#64748b',
    padding: '0',
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s ease'
  },
  notificationsList: {
    maxHeight: '400px',
    overflowY: 'auto'
  },
  noNotifications: {
    padding: '40px 20px',
    textAlign: 'center',
    color: '#64748b',
    fontSize: '14px'
  },
  notificationItem: {
    padding: '16px 20px',
    borderBottom: '1px solid #f1f5f9',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    position: 'relative'
  },
  unreadNotification: {
    backgroundColor: '#f0f9ff',
    borderLeft: '4px solid #3b82f6'
  },
  notificationSender: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '6px'
  },
  senderIcon: {
    fontSize: '16px'
  },
  senderName: {
    fontWeight: '600',
    fontSize: '14px',
    color: '#1e293b'
  },
  notificationTime: {
    fontSize: '12px',
    color: '#64748b',
    marginLeft: 'auto'
  },
  notificationMessage: {
    fontSize: '14px',
    color: '#374151',
    lineHeight: '1.4',
    paddingLeft: '24px'
  },
  unreadDot: {
    position: 'absolute',
    top: '16px',
    left: '8px',
    width: '8px',
    height: '8px',
    backgroundColor: '#22262cff',
    borderRadius: '50%'
  },
  statsGrid: {
    display: 'flex',
    gap: '20px',
    marginBottom: '30px',
    overflowX: 'auto',
    paddingBottom: '10px'
  },
  statCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    borderLeft: '4px solid',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    minWidth: '250px',
    flex: '0 0 auto'
  },
  statTitle: {
    fontSize: '14px',
    color: '#64748b',
    margin: '0 0 8px 0',
    fontWeight: '500'
  },
  statValue: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#1e293b',
    margin: '0 0 8px 0'
  },
  statChange: {
    fontSize: '14px',
    fontWeight: '500'
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '30px',
    marginBottom: '30px'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 20px 15px 20px',
    borderBottom: '1px solid #e2e8f0'
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1e293b',
    margin: 0
  },
  expandBtn: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    color: '#64748b',
    padding: '5px',
    borderRadius: '4px',
    transition: 'background-color 0.2s ease'
  },
  scheduleTable: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  tableHeader: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    backgroundColor: '#475569',
    color: 'white'
  },
  headerCell: {
    padding: '12px 20px',
    fontWeight: '600',
    fontSize: '14px'
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    borderBottom: '1px solid #e2e8f0'
  },
  cell: {
    padding: '12px 20px',
    fontSize: '14px',
    color: '#1e293b'
  },
  assignmentsList: {
    padding: '20px',
    flex: 1
  },
  assignmentItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '12px 0',
    borderBottom: '1px solid #e2e8f0'
  },
  assignmentIcon: {
    width: '40px',
    height: '40px',
    backgroundColor: '#f1f5f9',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px'
  },
  assignmentContent: {
    flex: 1
  },
  assignmentTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '4px'
  },
  assignmentSubtitle: {
    fontSize: '14px',
    color: '#64748b'
  },
  assignmentDue: {
    fontSize: '12px',
    color: '#64748b',
    fontWeight: '500'
  },
  upcomingClassesCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    marginBottom: '30px'
  },
  upcomingClassesList: {
    padding: '20px'
  },
  classItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '20px',
    padding: '15px 0',
    borderBottom: '1px solid #e2e8f0'
  },
  classTime: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b',
    minWidth: '80px'
  },
  classDetails: {
    flex: 1
  },
  className: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '4px'
  },
  classRoom: {
    fontSize: '14px',
    color: '#64748b'
  },
  navButtonsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: '20px'
  },
  navButton: {
    backgroundColor: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
    transform: 'translateY(0)',
  },
  navButtonHover: {
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    transform: 'translateY(-2px)',
    backgroundColor: '#f8fafc'
  },
  navButtonIcon: {
    fontSize: '24px',
    marginBottom: '5px'
  },
  navButtonTitle: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#64748b',
    textAlign: 'center'
  }
};