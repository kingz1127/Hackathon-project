import { useEffect, useState } from 'react';
import './TeacherClasses.css';

export default function TeacherClassesPage() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedClass, setExpandedClass] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [filterSemester, setFilterSemester] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [formData, setFormData] = useState({
    teacherId: "",
    className: "",
    description: "",
    scheduleDay: "Monday",
    scheduleTime: "",
    scheduleDuration: "90",
    semester: "Fall",
    academicYear: "2024-2025",
    room: "",
    maxStudents: "30",
  });

  // Fetch classes from API
  useEffect(() => {
    fetchClasses();
  }, [filterSemester, filterStatus]);

  const fetchClasses = async () => {
  setLoading(true);
  try {
    const res = await fetch("http://localhost:5000/api/classes/teacher");
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    setClasses(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error("Error fetching classes:", err);
    setClasses([]);
  } finally {
    setLoading(false);
  }
};


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        schedule: [
          {
            day: formData.scheduleDay,
            startTime: formData.scheduleTime,
            endTime: "", // optional
          },
        ],
      };

      const res = await fetch("http://localhost:5000/api/classes/teacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setClasses([data, ...classes]);
      setIsCreateModalOpen(false);
      resetForm();
    } catch (err) {
      console.error("Error creating class:", err);
    }
  };

  const handleEditClass = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        schedule: [
          {
            day: formData.scheduleDay,
            startTime: formData.scheduleTime,
            endTime: "", // optional
          },
        ],
      };

      const res = await fetch(
        `http://localhost:5000/api/classes/teacher/${editingClass._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      setClasses(classes.map((c) => (c._id === editingClass._id ? data : c)));
      setIsEditModalOpen(false);
      setEditingClass(null);
      resetForm();
    } catch (err) {
      console.error("Error updating class:", err);
    }
  };

  const handleDeleteClass = async (classId) => {
    if (!confirm("Are you sure you want to delete this class?")) return;
    try {
      await fetch(`http://localhost:5000/api/classes/teacher/${classId}`, {
        method: "DELETE",
      });
      setClasses(classes.filter((c) => c._id !== classId));
      if (expandedClass === classId) setExpandedClass(null);
    } catch (err) {
      console.error("Error deleting class:", err);
    }
  };

  const openEditModal = (classData) => {
    setEditingClass(classData);
    setFormData({
      teacherId: classData.teacherId,
      className: classData.className,
      description: classData.description || "",
      scheduleDay: classData.schedule?.[0]?.day || "Monday",
      scheduleTime: classData.schedule?.[0]?.startTime || "",
      scheduleDuration: classData.schedule?.[0]?.duration || "90",
      semester: classData.semester,
      academicYear: classData.academicYear,
      room: classData.room || "",
      maxStudents: classData.maxStudents || "30",
    });
    setIsEditModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      teacherId: "",
      className: "",
      description: "",
      scheduleDay: "Monday",
      scheduleTime: "",
      scheduleDuration: "90",
      semester: "Fall",
      academicYear: "2024-2025",
      room: "",
      maxStudents: "30",
    });
  };

  const toggleClassExpansion = (classId) => {
    setExpandedClass(expandedClass === classId ? null : classId);
  };

  if (loading) return <p>Loading classes...</p>;

  return (
    <>
    <div className="teacher-classes-page">
      <div className="page-header">
        <div className="header-left">
          <h1>📚 My Classes</h1>
          <p className="subtitle">{classes.length} {classes.length === 1 ? 'class' : 'classes'} total</p>
        </div>
        <button onClick={() => setIsCreateModalOpen(true)} className="btn-primary">
          <span className="plus-icon">+</span>
          Create New Class
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <select 
          value={filterSemester} 
          onChange={(e) => setFilterSemester(e.target.value)}
          className="filter-select"
        >
          <option value="">All Semesters</option>
          <option value="Fall">Fall</option>
          <option value="Spring">Spring</option>
          <option value="Summer">Summer</option>
        </select>

        <select 
          value={filterStatus} 
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Classes Grid */}
      {classes.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📚</span>
          <h3>No classes found</h3>
          <p>Create your first class to get started!</p>
        </div>
      ) : (
        <div className="classes-grid">
          {classes.map(classItem => (
            <div key={classItem._id} className="class-card">
              <div className="class-card-header">
                <div className="class-info">
                  <h3>{classItem.className}</h3>
                  <span className={`status-badge status-${classItem.status}`}>
                    {classItem.status}
                  </span>
                </div>
                <div className="class-actions">
                  <button onClick={() => openEditModal(classItem)} className="btn-icon" title="Edit">
                    ✏️
                  </button>
                  <button onClick={() => handleDeleteClass(classItem._id)} className="btn-icon btn-danger" title="Delete">
                    🗑️
                  </button>
                </div>
              </div>

              <div className="class-card-body">
                <div className="class-meta">
                  <div className="meta-item">
                    <span className="meta-icon">👥</span>
                    <span>{classItem.enrolledStudents?.length || 0}/{classItem.maxStudents} Students</span>
                  </div>
                  {classItem.schedule?.day && (
                    <div className="meta-item">
                      <span className="meta-icon">📅</span>
                      <span>{classItem.schedule.day} {classItem.schedule.time}</span>
                    </div>
                  )}
                  {classItem.room && (
                    <div className="meta-item">
                      <span className="meta-icon">🚪</span>
                      <span>{classItem.room}</span>
                    </div>
                  )}
                  <div className="meta-item">
                    <span className="meta-icon">📖</span>
                    <span>{classItem.semester} {classItem.academicYear}</span>
                  </div>
                </div>

                {classItem.description && (
                  <p className="class-description">{classItem.description}</p>
                )}

                <button 
                  onClick={() => toggleClassExpansion(classItem._id)}
                  className="btn-expand"
                >
                  {expandedClass === classItem._id ? '▲ Hide Details' : '▼ Show Details'}
                </button>

                {/* Expanded Details */}
                {expandedClass === classItem._id && (
                  <div className="class-details-expanded">
                    <div className="details-section">
                      <h4>📋 Class Information</h4>
                      <div className="details-grid">
                        <div className="detail-row">
                          <strong>Course Code:</strong>
                          <span>{classItem.courseId?.code || 'N/A'}</span>
                        </div>
                        <div className="detail-row">
                          <strong>Duration:</strong>
                          <span>{classItem.schedule?.duration || 0} minutes</span>
                        </div>
                        <div className="detail-row">
                          <strong>Max Students:</strong>
                          <span>{classItem.maxStudents}</span>
                        </div>
                      </div>
                    </div>

                    <div className="details-section">
                      <h4>👥 Enrolled Students</h4>
                      {classItem.enrolledStudents?.length > 0 ? (
                        <div className="students-list">
                          {classItem.enrolledStudents.map(student => (
                            <div key={student._id} className="student-item">
                              <div className="student-info">
                                <span className="student-name">{student.name}</span>
                                <span className="student-email">{student.email}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="no-data">No students enrolled yet</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

  {/* Create/Edit Modal */}
{(isCreateModalOpen || isEditModalOpen) && (
  <div 
    className="modal-overlay" 
    onClick={() => {
      closeModal();
    }}
  >
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <h2>{isEditModalOpen ? 'Edit Class' : 'Create New Class'}</h2>
        <button onClick={closeModal} className="close-btn">✕</button>
      </div>

            <div className="modal-form">
              <div className="form-group">
                <label>Class Name <span className="required">*</span></label>
                <input
                  type="text"
                  name="className"
                  value={formData.className}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Mathematics 101 - Section A"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Brief description of the class"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Day <span className="required">*</span></label>
                  <select
                    name="scheduleDay"
                    value={formData.scheduleDay}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                    <option value="Sunday">Sunday</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Time <span className="required">*</span></label>
                  <input
                    type="time"
                    name="scheduleTime"
                    value={formData.scheduleTime}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Duration (min)</label>
                  <input
                    type="number"
                    name="scheduleDuration"
                    value={formData.scheduleDuration}
                    onChange={handleInputChange}
                    min="30"
                    step="15"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Semester <span className="required">*</span></label>
                  <select
                    name="semester"
                    value={formData.semester}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Fall">Fall</option>
                    <option value="Spring">Spring</option>
                    <option value="Summer">Summer</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Academic Year <span className="required">*</span></label>
                  <input
                    type="text"
                    name="academicYear"
                    value={formData.academicYear}
                    onChange={handleInputChange}
                    required
                    placeholder="2024-2025"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Room</label>
                  <input
                    type="text"
                    name="room"
                    value={formData.room}
                    onChange={handleInputChange}
                    placeholder="e.g., Room 203"
                  />
                </div>

                <div className="form-group">
                  <label>Max Students</label>
                  <input
                    type="number"
                    name="maxStudents"
                    value={formData.maxStudents}
                    onChange={handleInputChange}
                    min="1"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setIsEditModalOpen(false);
                    resetForm();
                  }} 
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={isEditModalOpen ? handleEditClass : handleCreateClass} 
                  className="btn-primary"
                >
                  {isEditModalOpen ? 'Update Class' : 'Create Class'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}