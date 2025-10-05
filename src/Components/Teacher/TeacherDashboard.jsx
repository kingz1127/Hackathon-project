// src/pages/TeacherDashboard.jsx
import { useEffect, useState } from "react";
import { FaBell, FaChalkboard, FaChalkboardTeacher, FaEnvelope, FaTasks, FaTimes, FaTrash, FaUserGraduate } from "react-icons/fa";
import "./Teacher.css";


export default function TeacherDashboard() {
  const [teacher, setTeacher] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [teacherId, setTeacherId] = useState(null);
  const [replyTexts, setReplyTexts] = useState({});

 useEffect(() => {
  const storedTeacherId = localStorage.getItem("teacherId");
  if (!storedTeacherId) {
    console.error("No teacherId found in localStorage. User not logged in?");
    return;
  }
  setTeacherId(storedTeacherId);

  // Fetch teacher data
  fetch(`http://localhost:5000/admin/teachers/${storedTeacherId}`)
    .then((res) => {
      if (!res.ok) throw new Error(`Failed to fetch teacher. Status: ${res.status}`);
      return res.json();
    })
    .then((data) => setTeacher(data))
    .catch((err) => console.error("Error fetching teacher:", err));

  // Fetch teacher notifications
  const fetchNotifications = async () => {
    const url = `http://localhost:5000/messages/teacher/${storedTeacherId}`;
    console.log("Fetching notifications for:", storedTeacherId, "URL:", url);

    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.error(`Notifications fetch failed. Status: ${res.status}`);
        return; // stop further processing
      }

      const data = await res.json();
      console.log("Fetched notifications:", data);

      const sortedData = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setNotifications(sortedData);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  fetchNotifications();
  const interval = setInterval(fetchNotifications, 10000); // poll every 10s
  return () => clearInterval(interval);
}, []);


  // Mark notification as read
  const markAsRead = async (id) => {
    try {
      await fetch(`http://localhost:5000/messages/read/${id}`, { 
        method: "PATCH",
        headers: { "Content-Type": "application/json" }
      });
      
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  // Delete single notification
  const deleteNotification = async (id) => {
    try {
      await fetch(`http://localhost:5000/messages/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      });
      
      setNotifications((prev) => prev.filter(n => n._id !== id));
    } catch (err) {
      console.error("Error deleting notification:", err);
      alert("Failed to delete notification");
    }
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    if (!window.confirm("Are you sure you want to clear all notifications?")) {
      return;
    }

    try {
      const deletePromises = notifications.map(notification =>
        fetch(`http://localhost:5000/messages/${notification._id}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" }
        })
      );

      await Promise.all(deletePromises);
      setNotifications([]);
      alert("All notifications cleared successfully!");
    } catch (err) {
      console.error("Error clearing all notifications:", err);
      alert("Failed to clear all notifications");
    }
  };

  // Reply to student message
 const replyToStudent = async (studentId, replyMessage, notifId) => {
  if (!replyMessage || !replyMessage.trim()) {
    alert("Please enter a reply message");
    return;
  }

  try {
    const response = await fetch(`http://localhost:5000/messages/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        senderId: teacherId,
        senderName: teacher?.FullName || "Teacher",
        receiverId: studentId,
        content: replyMessage,
      }),
    });

    if (!response.ok) throw new Error("Failed to send reply");

    await markAsRead(notifId);

    // Clear reply input
    setReplyTexts(prev => ({
      ...prev,
      [notifId]: ""
    }));

    alert("Reply sent successfully!");
  } catch (err) {
    console.error("Error replying:", err);
    alert("Failed to send reply. Please try again.");
  }
};


  // Update reply text for specific notification
  const updateReplyText = (notifId, text) => {
  setReplyTexts(prev => ({
    ...prev,
    [notifId]: text
  }));
};
  const unreadCount = notifications.filter((n) => !n.isRead).length;
      
  return (
    <div className="main-content">
      {/* Header */}
      <div className="header">
        <h1 className="page-title">Teacher Dashboard</h1>
        <div className="header-actions">
          <div className="profile-name">
            {teacher ? teacher.FullName : "Loading..."}
          </div>
          <div className="notification-bell" onClick={() => setShowNotifications(!showNotifications)}>
            <FaBell />
            {unreadCount > 0 && (
              <div className="notification-badge">{unreadCount}</div>
            )}
          </div>
        </div>
      </div>

      {/* Notification Panel */}
      {showNotifications && (
        <div className="notification-panel">
          <div className="notification-header">
            <h3>Notifications</h3>
            <div className="notification-actions">
              {notifications.length > 0 && (
                <button className="clear-all-btn" onClick={clearAllNotifications}>
                  Clear All
                </button>
              )}
              <button className="close-btn" onClick={() => setShowNotifications(false)}>
                <FaTimes />
              </button>
            </div>
          </div>
          
          <div className="notifications-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">No notifications</div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                >
                  <div className="notification-header-item">
                    <div className="notification-sender">
                      <span className="sender-icon">👨‍🎓</span>
                      <span className="sender-name">{notification.senderName}</span>
                      <span className="notification-time">
                        {new Date(notification.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <button 
                      className="delete-notification-btn"
                      onClick={() => deleteNotification(notification._id)}
                      title="Delete notification"
                    >
                      <FaTrash />
                    </button>
                  </div>

                  <div className="notification-message">
                    {notification.content}
                  </div>

                  <div className="notification-actions-item">
                    {!notification.isRead && (
                      <button
                        className="mark-read-btn"
                        onClick={() => markAsRead(notification._id)}
                      >
                        Mark as Read
                      </button>
                    )}
                  </div>

                  {/* Reply Section */}
                  <div className="reply-section">
                   <input
  type="text"
  placeholder="Reply to student..."
  value={replyTexts[notification._id] || ""}
  onChange={(e) => updateReplyText(notification._id, e.target.value)}
  className="reply-input"
  onKeyPress={(e) => {
    if (e.key === 'Enter') {
      replyToStudent(
        notification.senderId,
        replyTexts[notification._id],
        notification._id
      );
    }
  }}
/>
<button
  className="reply-btn"
  onClick={() =>
    replyToStudent(
      notification.senderId,
      replyTexts[notification._id],
      notification._id
    )
  }
>
  Reply
</button>

                  </div>

                  {!notification.isRead && <div className="unread-indicator"></div>}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Dashboard Cards */}
      <div className="dashboard-cards">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Classes Teaching</div>
            <div className="card-icon" style={{ backgroundColor: "#e8f8f5", color: "var(--teal)" }}>
              <FaChalkboardTeacher />
            </div>
          </div>
          <div className="card-value">5</div>
          <div className="card-description">Active classes this semester</div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Students</div>
            <div className="card-icon" style={{ backgroundColor: "#eaf2f8", color: "var(--blue)" }}>
              <FaUserGraduate />
            </div>
          </div>
          <div className="card-description">
            Total students
           
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Assignments Due</div>
            <div className="card-icon" style={{ backgroundColor: "#fef9e7", color: "var(--accent)" }}>
              <FaTasks />
            </div>
          </div>
          <div className="card-value">7</div>
          <div className="card-description">To be graded this week</div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Unread Messages</div>
            <div className="card-icon" style={{ backgroundColor: "#f5eef8", color: "var(--purple)" }}>
              <FaEnvelope />
            </div>
          </div>
          <div className="card-value">{unreadCount}</div>
          <div className="card-description">From students</div>
        </div>
      </div>

      {/* Classes Section */}
      <h2 className="section-title"><FaChalkboard /> My Classes</h2>

      {/* Example Classes Grid */}
      <div className="classes-grid">
        <div className="class-card">
          <div className="class-header">
            <h3 className="class-title">Simple Arithmetics</h3>
            <div className="class-meta">
              <span><i className="fas fa-clock"></i> Mon/Wed 9:00-10:30</span>
              <span><i className="fas fa-map-marker-alt"></i> Bldg A-205</span>
            </div>
          </div>
          <div className="class-body">
            <div className="class-stats">
              <div className="stat-item"><div className="stat-value">32</div><div className="stat-label">Students</div></div>
              <div className="stat-item"><div className="stat-value">4</div><div className="stat-label">Assignments</div></div>
              <div className="stat-item"><div className="stat-value">92%</div><div className="stat-label">Attendance</div></div>
            </div>
            <div className="class-actions">
              <button className="btn btn-primary"><i className="fas fa-clipboard-list"></i> Attendance</button>
              <button className="btn btn-secondary"><i className="fas fa-book"></i> Materials</button>
            </div>
          </div>
        </div>
      </div>

      {/* Assignments Section */}
      <h2 className="section-title" style={{ marginTop: "30px" }}>
        <FaTasks /> Assignments to Grade
      </h2>

      <div className="assignments-table">
        <div className="table-header">
          <div>Assignment</div>
          <div>Class</div>
          <div>Due Date</div>
          <div>Status</div>
        </div>

        <div className="table-row">
          <div className="assignment-name">Chapter 5 Quiz</div>
          <div className="class-name">Learning LCM</div>
          <div className="due-date">Tomorrow</div>
          <div className="status-badge status-pending">Pending</div>
        </div>
      </div>
    </div>

    
  );
}