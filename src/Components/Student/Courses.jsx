import { useState } from 'react';
import { FaCommentDots } from 'react-icons/fa';
import TeacherChatBubble from "./TeacherChatBubbble";
import './courses.css'; // Import the external CSS

// Course Card Component
function CourseCard({ course, onViewDetails }) {
  const [isHovered, setIsHovered] = useState(false);

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'green';
    if (progress >= 60) return 'orange';
    if (progress >= 40) return 'red';
    return '#6b7280';
  };

  return (
    <div
      className={`course-card ${isHovered ? 'course-card-hover' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="course-header">
        <div className="course-icon">{course.icon}</div>
        <div className="course-meta">
          <span className="course-level">{course.level}</span>
          <span className="course-duration">{course.duration}</span>
        </div>
      </div>

      <h3 className="course-title">{course.title}</h3>
      <p className="course-description">{course.description}</p>

      <div className="progress-section">
        <div className="progress-header">
          <span className="progress-label">Progress</span>
          <span className="progress-percentage">{course.progress}%</span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${course.progress}%`, backgroundColor: getProgressColor(course.progress) }}
          />
        </div>
      </div>

      <div className="course-stats">
        <div className="stat-item">
          <span className="stat-icon">📚</span>
          <span className="stat-text">{course.modules} Modules</span>
        </div>
        <div className="stat-item">
          <span className="stat-icon">⏱️</span>
          <span className="stat-text">{course.hours}h</span>
        </div>
        <div className="stat-item">
          <span className="stat-icon">👨‍🏫</span>
          <span className="stat-text">{course.instructor}</span>
        </div>
      </div>

      <button className="view-details-btn" onClick={() => onViewDetails(course)}>
        View Details
      </button>
    </div>
  );
}

// Filter Button Component
function FilterButton({ label, isActive, onClick }) {
  return (
    <button
      className={`filter-btn ${isActive ? 'filter-btn-active' : ''}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

export default function Courses() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [teacherChatOpen, setTeacherChatOpen] = useState(false);
  const [teacherMessages, setTeacherMessages] = useState([]);
  const [teacherMessage, setTeacherMessage] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const studentId = localStorage.getItem("studentId");

  const courses = [
    // ... your courses array (same as before)
  ];

  const filters = ['All', 'In Progress', 'Completed', 'Not Started'];

  const filteredCourses = courses.filter(course => {
    const matchesFilter = activeFilter === 'All' || course.status === activeFilter;
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          course.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleViewDetails = (course) => {
    alert(`Viewing details for: ${course.title}\n\nTechnologies: ${course.technologies.join(', ')}\nInstructor: ${course.instructor}\nStatus: ${course.status}`);
  };

  const stats = {
    totalCourses: courses.length,
    inProgress: courses.filter(c => c.status === 'In Progress').length,
    completed: courses.filter(c => c.status === 'Completed').length,
    totalHours: courses.reduce((sum, c) => sum + c.hours, 0)
  };

  const openTeacherChat = async (teacherName) => {
    if (!teacherName) return;
    setSelectedTeacher(teacherName);
    setTeacherChatOpen(true);

    try {
      const res = await fetch(`http://localhost:5000/messages/student/${studentId}`);
      const data = await res.json();
      const teacherChat = data.filter(
        msg => msg.senderName === teacherName || msg.receiverId === teacherName
      );
      setTeacherMessages(teacherChat);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  const sendMessageToTeacher = async () => {
    if (!teacherMessage.trim() || !selectedTeacher) return;

    try {
      const res = await fetch(`http://localhost:5000/messages/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: studentId,
          senderName: "Student",
          receiverId: selectedTeacher,
          content: teacherMessage.trim(),
        }),
      });

      if (res.ok) {
        const newMsg = await res.json();
        setTeacherMessages(prev => [...prev, newMsg]);
        setTeacherMessage("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1 className="title">My Courses</h1>
        <p className="subtitle">Track your learning journey at NIIT</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <div className="stat-number">{stats.totalCourses}</div>
            <div className="stat-label">Total Courses</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <div className="stat-number">{stats.inProgress}</div>
            <div className="stat-label">In Progress</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-number">{stats.completed}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-content">
            <div className="stat-number">{stats.totalHours}</div>
            <div className="stat-label">Total Hours</div>
          </div>
        </div>
      </div>

      <div className="controls-section">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="filters-container">
          {filters.map(filter => (
            <FilterButton
              key={filter}
              label={filter}
              isActive={activeFilter === filter}
              onClick={() => setActiveFilter(filter)}
            />
          ))}
        </div>
      </div>

      <div className="courses-grid">
        {filteredCourses.map(course => (
          <CourseCard
            key={course.id}
            course={course}
            onViewDetails={handleViewDetails}
          />
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3 className="empty-title">No courses found</h3>
          <p className="empty-description">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}

      {teacherChatOpen && (
        <TeacherChatBubble
          messages={teacherMessages}
          message={teacherMessage}
          setMessage={setTeacherMessage}
          sendMessage={sendMessageToTeacher}
          teacherName={selectedTeacher}
          studentId={studentId}
          teacherId={selectedTeacher}
          onClose={() => setTeacherChatOpen(false)}
        />
      )}

      <button
        className="comment-button"
        onMouseEnter={e => e.currentTarget.classList.add('comment-button-hover')}
        onMouseLeave={e => e.currentTarget.classList.remove('comment-button-hover')}
        onClick={() => openTeacherChat(selectedTeacher || "Teacher")}
      >
        <FaCommentDots />
      </button>
    </div>
  );
}
