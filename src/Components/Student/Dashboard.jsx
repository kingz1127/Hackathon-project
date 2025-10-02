import { useEffect, useState } from 'react';
import { FaTrash } from "react-icons/fa";
import "./dashboard.css"; // Import the new CSS file
import TeacherChatBubble from "./TeacherChatBubbble";

// Navigation Button Component with hover effects
function NavButton({ icon, title, onClick }) {
  return (
    <button className="nav-button" onClick={onClick}>
      <div className="nav-button-icon">{icon}</div>
      <div className="nav-button-title">{title}</div>
    </button>
  ); 
}

// Profile Icon Component
function ProfileIcon({ course = "Full Stack Development", semester = "Semester 3", setActive }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [studentName, setStudentName] = useState("Loading...");
  const [studentImg, setStudentImg] = useState(null);
  const [studentCourse, setStudentCourse] = useState(null);

  const [notifications, setNotifications] = useState([]);
  const [replyTexts, setReplyTexts] = useState({});

  useEffect(() => {
    const studentId = localStorage.getItem("studentId");
    if (!studentId) return;

    fetch(`http://localhost:5000/admin/students/${studentId}`)
      .then((res) => res.json())
      .then((data) => {
        setStudentName(data.fullName || "Unknown Student");
        setStudentImg(data.studentImg || null);
        setStudentCourse(data.course || "Unknown course");
      })
      .catch((err) => {
        console.error("Error fetching student:", err);
        setStudentName("Error loading student");
      });

    const fetchNotifications = () => {
      fetch(`http://localhost:5000/messages/student/${studentId}`)
        .then((res) => res.json())
        .then((data) => {
          const sortedData = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          setNotifications(sortedData);
        })
        .catch((err) => console.error("Error fetching notifications:", err));
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);

  }, []);

  function getInitials(name) {
    if (!name) return "";
    const parts = name.split(" ");
    return parts.map(p => p.charAt(0).toUpperCase()).join("");
  }

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

  const deleteNotification = async (id) => {
    try {
      await fetch(`http://localhost:5000/messages/${id}`, { method: "DELETE" });
      setNotifications((prev) => prev.filter(n => n._id !== id));
    } catch (err) {
      console.error("Error deleting notification:", err);
      alert("Failed to delete notification");
    }
  };

  const clearAllNotifications = async () => {
    if (!window.confirm("Are you sure you want to clear all notifications?")) return;

    try {
      const deletePromises = notifications.map(notification =>
        fetch(`http://localhost:5000/messages/${notification._id}`, { method: "DELETE" })
      );
      await Promise.all(deletePromises);
      setNotifications([]);
      alert("All notifications cleared successfully!");
    } catch (err) {
      console.error("Error clearing all notifications:", err);
      alert("Failed to clear all notifications");
    }
  };

  const markAsRead = async (id) => {
    try {
      await fetch(`http://localhost:5000/messages/read/${id}`, { method: "PATCH" });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleReply = async (teacherId, replyMessage, notifId) => {
    if (!replyMessage || !replyMessage.trim()) {
      alert("Please enter a reply message");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/messages/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: localStorage.getItem("studentId"),
          senderName: studentName,
          receiverId: teacherId,
          content: replyMessage,
        }),
      });

      if (!response.ok) throw new Error("Failed to send reply");

      setReplyTexts(prev => ({ ...prev, [notifId]: "" }));
      await markAsRead(notifId);
      alert("Reply sent successfully!");
      
    } catch (err) {
      console.error("Error replying:", err);
      alert("Failed to send reply. Please try again.");
    }
  };

  const updateReplyText = (notifId, text) => {
    setReplyTexts(prev => ({ ...prev, [notifId]: text }));
  };

  return (
    <div className="profile-container">
      <div className="profile-info">
        <span className="grade-class">{studentCourse} - {semester}</span>
      </div>

      <div className="profile-icon" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
        <div className="profile-avatar">{getInitials(studentName)}</div>

        {unreadCount > 0 && <div className="notification-badge">{unreadCount}</div>}
        
        {isDropdownOpen && (
          <div className="dropdown">
            <div className="dropdown-item" onClick={handleNotifications}>
              Notifications {unreadCount > 0 && <span className="badge-inline">({unreadCount})</span>}
            </div>
            <div className="dropdown-item" onClick={handleSettings}>Settings</div>
            <div className="dropdown-item sign-out-item" onClick={handleSignOut}>Sign Out</div>
          </div>
        )}
      </div>

      {showNotifications && (
        <div className="notification-panel">
          <div className="notification-header">
            <h3 className="notification-title">Notifications</h3>
            <div className="notification-header-actions">
              {notifications.length > 0 && (
                <button className="clear-all-btn" onClick={clearAllNotifications}>Clear All</button>
              )}
              <button className="close-btn" onClick={() => setShowNotifications(false)}>×</button>
            </div>
          </div>
          <div className="notifications-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">No new notifications</div>
            ) : (
              notifications.map((notification) => (
                <div key={notification._id} className={`notification-item ${notification.isRead ? '' : 'unread-notification'}`}>
                  <div className="notification-sender">
                    <span className="sender-icon"> 👨‍🏫 </span>
                    <span className="sender-name">{notification.senderName}</span>
                    <span className="notification-time">{new Date(notification.timestamp).toLocaleString()}</span>
                    <button className="delete-btn" onClick={() => deleteNotification(notification._id)} title="Delete notification"><FaTrash /></button>
                  </div>
                  <div className="notification-message">{notification.content}</div>
                  <div className="action-buttons">
                    {!notification.isRead && <button className="mark-read-btn" onClick={() => markAsRead(notification._id)}>Mark as Read</button>}
                  </div>
                  <div className="reply-box">
                    <input
                      type="text"
                      placeholder="Reply to teacher..."
                      value={replyTexts[notification._id] || ""}
                      onChange={(e) => updateReplyText(notification._id, e.target.value)}
                      onKeyPress={(e) => { if(e.key === 'Enter') handleReply(notification.senderId, replyTexts[notification._id], notification._id) }}
                    />
                    <button onClick={() => handleReply(notification.senderId, replyTexts[notification._id], notification._id)}>Send</button>
                  </div>
                  {!notification.isRead && <div className="unread-dot"></div>}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Dashboard({ setActive }) {
  const [isClassesExpanded, setIsClassesExpanded] = useState(false);
  const [isScheduleExpanded, setIsScheduleExpanded] = useState(false);
  const [isAssignmentsExpanded, setIsAssignmentsExpanded] = useState(false);

  // Dummy data for assignments and schedule
  const assignments = [
    {
      icon: "📝",
      title: "Math Homework",
      subtitle: "Algebra - Chapter 5",
      dueDate: "Due: 2024-06-10",
    },
    {
      icon: "📝",
      title: "Science Project",
      subtitle: "Physics - Newton's Laws",
      dueDate: "Due: 2024-06-12",
    },
    {
      icon: "📝",
      title: "English Essay",
      subtitle: "Literature Analysis",
      dueDate: "Due: 2024-06-15",
    },
  ];

  const extendedAssignments = [
    ...assignments,
    {
      icon: "📝",
      title: "History Presentation",
      subtitle: "World War II",
      dueDate: "Due: 2024-06-18",
    },
    {
      icon: "📝",
      title: "Computer Lab",
      subtitle: "React Project",
      dueDate: "Due: 2024-06-20",
    },
  ];

  const schedule = [
    {
      time: "08:00 - 09:00",
      subject: "Mathematics",
      teacher: "Mr. Smith",
    },
    {
      time: "09:15 - 10:15",
      subject: "Science",
      teacher: "Ms. Johnson",
    },
    {
      time: "10:30 - 11:30",
      subject: "English",
      teacher: "Mrs. Lee",
    },
  ];

  const extendedSchedule = [
    ...schedule,
    {
      time: "11:45 - 12:45",
      subject: "History",
      teacher: "Mr. Brown",
    },
    {
      time: "13:00 - 14:00",
      subject: "Computer Science",
      teacher: "Ms. Davis",
    },
  ];

  // Teacher chat states
  const [teacherChatOpen, setTeacherChatOpen] = useState(false);
  const [teacherMessages, setTeacherMessages] = useState([]);
  const [teacherMessage, setTeacherMessage] = useState("");
  const [teacherName, setTeacherName] = useState("Teacher");
  const teacherId = localStorage.getItem("teacherId");
  const studentId = localStorage.getItem("studentId");

  const [studentName, setStudentName] = useState("Loading...");
  const [studentImg, setStudentImg] = useState(null);
  const [studentCourse, setStudentCourse] = useState("Loading...");

  useEffect(() => {
    if (!studentId) return;
    fetch(`http://localhost:5000/admin/students/${studentId}`)
      .then((res) => res.json())
      .then((data) => {
        setStudentName(data.fullName || "Unknown Student");
        setStudentImg(data.studentImg || null);
        setStudentCourse(data.course || null);
      })
      .catch((err) => {
        console.error("Error fetching student:", err);
        setStudentName("Error loading student");
      });
  }, [studentId]);

 const openTeacherChat = async () => {
  setTeacherChatOpen(true);
  try {
    console.log({
  senderId: localStorage.getItem("studentId"),
  senderName: studentName,
  receiverId: teacherId,
  content: teacherMessage,
});

    const res = await fetch(`http://localhost:5000/messages/student/${studentId}`);
    const data = await res.json();
    const teacherChat = data.filter(
      msg => msg.senderId === teacherId || msg.receiverId === teacherId
    );
    setTeacherMessages(teacherChat);
  } catch (err) {
    
    console.error("Error fetching teacher messages:", err);
  }
};

const sendMessageToTeacher = async () => {
  if (!teacherMessage || !teacherMessage.trim()) {
    alert("Message cannot be empty!");
    return;
  }

  if (!teacherId) {
    alert("Teacher ID is missing. Cannot send message.");
    return;
  }

  try {
    const response = await fetch(`http://localhost:5000/messages/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        senderId: studentId,
        senderName: studentName,
        receiverId: teacherId,
        content: teacherMessage.trim(),
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Send message failed:", text);
      alert("Failed to send message. See console for details.");
      return;
    }

    const data = await response.json();
    setTeacherMessages(prev => [...prev, data]);
    setTeacherMessage("");
  } catch (err) {
    console.error("Error sending message:", err);
    alert("Failed to send message. Please try again.");
  }
};


  return (
   <div className="full-container">
  <div className="header">
    <h1>Dashboard</h1>
    <ProfileIcon course={studentCourse} semester="Semester 3" setActive={setActive} />
  </div>
  
  <div className="welcome">Welcome, {studentName}</div>



<div className="main-grid">
  {/* Today's Schedule */}
  <div className="card">
    <div className="card-header">
      <h2 className="card-title">Today's Schedule</h2>
      <button 
        className="expand-btn"
        onClick={() => setIsScheduleExpanded(!isScheduleExpanded)}
      >
        {isScheduleExpanded ? '−' : '+'}
      </button>
    </div>

    <div className="schedule-table">
      <div className="table-header">
        <div className="cell">Time</div>
        <div className="cell">Subject</div>
        <div className="cell">Teacher</div>
      </div>
      <div style={{ maxHeight: isScheduleExpanded ? '400px' : '250px' }}>
        {schedule.map((item, index) => (
          <div key={index} className="table-row">
            <div className="cell">{item.time}</div>
            <div className="cell">{item.subject}</div>
            <div className="cell">{item.teacher}</div>
          </div>
        ))}
      </div>
    </div>
  </div>

  {/* Upcoming Assignments */}
  <div className="card">
    <div className="card-header">
      <h2 className="card-title">Upcoming Assignments</h2>
      <button 
        className="expand-btn"
        onClick={() => setIsAssignmentsExpanded(!isAssignmentsExpanded)}
      >
        {isAssignmentsExpanded ? '−' : '+'}
      </button>
    </div>

    <div 
      className="assignments-list" 
      style={{ maxHeight: isAssignmentsExpanded ? '400px' : '280px' }}
    >
      {assignments.length === 0 ? (
        <div style={{ padding: '12px', color: '#64748b', textAlign: 'center' }}>
          No upcoming assignments
        </div>
      ) : (
        assignments.map((assignment, index) => (
          <div key={index} className="assignment-item">
            <div className="assignment-icon">{assignment.icon}</div>
            <div className="assignment-content">
              <div className="assignment-title">{assignment.title}</div>
              <div className="assignment-subtitle">{assignment.subtitle}</div>
            </div>
            <div className="assignment-due">{assignment.dueDate}</div>
          </div>
        ))
      )}
    </div>
  </div>
</div>



<div className="upcoming-classes-card">
  <div className="card-header">
    <h2 className="card-title">Upcoming Classes</h2>
    <button 
      className="expand-btn"
      onClick={() => setIsClassesExpanded(!isClassesExpanded)}
    >
      {isClassesExpanded ? '−' : '+'}
    </button>
  </div>

  <div 
    className="upcoming-classes-list" 
    style={{ maxHeight: isClassesExpanded ? '400px' : '200px' }}
  >
    {/* Example class items */}
    <div className="class-item">
      <div className="class-time">Now - 9:00</div>
      <div className="class-details">
        <div className="class-name">Algorithm Design</div>
        <div className="class-room">Lab 205 - Advanced Data Structures & Algorithms</div>
      </div>
    </div>

    <div className="class-item">
      <div className="class-time">9:15 - 10:15</div>
      <div className="class-details">
        <div className="class-name">Full-Stack Development</div>
        <div className="class-room">Lab 3 - React & Node.js Workshop</div>
      </div>
    </div>

    <div className="class-item">
      <div className="class-time">10:30 - 11:30</div>
      <div className="class-details">
        <div className="class-name">Software Architecture</div>
        <div className="class-room">Room 112 - Design Patterns & System Design</div>
      </div>
    </div>

    {isClassesExpanded && (
      <>
        <div className="class-item">
          <div className="class-time">12:00 - 1:00</div>
          <div className="class-details">
            <div className="class-name">DevOps & Cloud</div>
            <div className="class-room">Lab 4 - Docker, Kubernetes & AWS</div>
          </div>
        </div>

        <div className="class-item">
          <div className="class-time">1:15 - 2:15</div>
          <div className="class-details">
            <div className="class-name">Mobile Development</div>
            <div className="class-room">Lab 6 - React Native & Flutter</div>
          </div>
        </div>

        <div className="class-item">
          <div className="class-time">2:30 - 3:30</div>
          <div className="class-details">
            <div className="class-name">Database Optimization</div>
            <div className="class-room">Room 201 - SQL Performance & NoSQL</div>
          </div>
        </div>
      </>
    )}
  </div>
</div>


      {/* Navigation Buttons */}
      <div className="nav-buttons-grid">
        <NavButton title="Classes" icon="📚" onClick={() => setIsClassesExpanded(!isClassesExpanded)} />
        <NavButton title="Schedule" icon="📅" onClick={() => setIsScheduleExpanded(!isScheduleExpanded)} />
        <NavButton title="Assignments" icon="📝" onClick={() => setIsAssignmentsExpanded(!isAssignmentsExpanded)} />
        <NavButton title="Exams" icon="✏️" onClick={() => alert("Exams clicked")} />
        <NavButton title="Results" icon="🏆" onClick={() => alert("Results clicked")} />
        <NavButton title="Chat Teacher" icon="💬" onClick={openTeacherChat} />
      </div>

      {/* Teacher Chat Modal */}
      {teacherChatOpen && (
        <TeacherChatBubble
          messages={teacherMessages}
          onClose={() => setTeacherChatOpen(false)}
          teacherName={teacherName}
          message={teacherMessage}
          setMessage={setTeacherMessage}
          sendMessage={sendMessageToTeacher}
        />
      )}
    </div>
  );
}
