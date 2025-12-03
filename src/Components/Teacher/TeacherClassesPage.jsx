import { useEffect, useState } from "react";
import "./TeacherClasses.css";

export default function TeacherClassesPage() {
  const teacherId = localStorage.getItem("teacherId");

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedClass, setExpandedClass] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);

  const [filterSemester, setFilterSemester] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Form state + files (attachments)
  const [formData, setFormData] = useState({
    teacherId: teacherId,
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
  const [formFiles, setFormFiles] = useState([]); // File objects selected by user

  /* -------------------------
     Fetch classes
  ------------------------- */
  useEffect(() => {
    fetchClasses();
  }, [filterSemester, filterStatus]);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/classes/teacher/${teacherId}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setClasses(Array.isArray(data) ? data : []);
      setCurrentPage(1); // reset to page 1 on new fetch/filter
    } catch (err) {
      console.error("Error fetching classes:", err);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------
     Input handlers
  ------------------------- */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    setFormFiles(files);
  };

  const clearFileSelection = () => {
    setFormFiles([]);
    // If you want to also reset the file input DOM element you'll need a ref; this is fine for now.
  };

  /* -------------------------
     Utility: calculate end time
  ------------------------- */
  const calculateEndTime = (fd = formData) => {
    if (!fd.scheduleTime) return "";
    const [h, m] = fd.scheduleTime.split(":").map(Number);
    const duration = Number(fd.scheduleDuration || 0);

    let endH = h + Math.floor((m + duration) / 60);
    let endM = (m + duration) % 60;

    // if endH >=24 you might want to wrap or keep as is. We'll keep numeric hours.
    return `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;
  };

  /* -------------------------
     Create class (supports attachments)
  ------------------------- */
  const handleCreateClass = async (e) => {
    e.preventDefault();

    const scheduleObj = [
      {
        day: formData.scheduleDay,
        startTime: formData.scheduleTime,
        duration: formData.scheduleDuration,
        endTime: calculateEndTime(),
      },
    ];

    try {
      let res;
      // If files selected, use FormData (multipart)
      if (formFiles.length > 0) {
        const fd = new FormData();
        // append simple fields
        fd.append("teacherId", formData.teacherId);
        fd.append("className", formData.className);
        fd.append("description", formData.description);
        fd.append("semester", formData.semester);
        fd.append("academicYear", formData.academicYear);
        fd.append("room", formData.room);
        fd.append("maxStudents", String(formData.maxStudents));
        fd.append("schedule", JSON.stringify(scheduleObj)); // server should parse this
        // append files (multiple)
        formFiles.forEach((file) => {
          // use key `attachments` (server should accept this)
          fd.append("attachments", file);
        });

        res = await fetch("http://localhost:5000/api/classes/teacher", {
          method: "POST",
          body: fd, // browser sets Content-Type with boundary
        });
      } else {
        // No files -> send JSON
        const payload = {
          ...formData,
          schedule: scheduleObj,
        };
        res = await fetch("http://localhost:5000/api/classes/teacher", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const created = await res.json();

      setClasses((prev) => [created, ...prev]);
      setIsCreateModalOpen(false);
      resetForm();
      clearFileSelection();
      setCurrentPage(1); // show newest created on page 1
    } catch (err) {
      console.error("Error creating class:", err);
    }
  };

  /* -------------------------
     Edit class (supports adding attachments)
     - This implementation adds new attachments; it does not remove existing attachments.
       Removing existing attachments would need extra UI + backend support.
  ------------------------- */
  const handleEditClass = async (e) => {
    e.preventDefault();
    if (!editingClass) return;

    const scheduleObj = [
      {
        day: formData.scheduleDay,
        startTime: formData.scheduleTime,
        duration: formData.scheduleDuration,
        endTime: calculateEndTime(),
      },
    ];

    try {
      let res;
      if (formFiles.length > 0) {
        const fd = new FormData();
        fd.append("teacherId", formData.teacherId);
        fd.append("className", formData.className);
        fd.append("description", formData.description);
        fd.append("semester", formData.semester);
        fd.append("academicYear", formData.academicYear);
        fd.append("room", formData.room);
        fd.append("maxStudents", String(formData.maxStudents));
        fd.append("schedule", JSON.stringify(scheduleObj));
        // Append new files to add
        formFiles.forEach((file) => fd.append("attachments", file));

        res = await fetch(
          `http://localhost:5000/api/classes/teacher/${editingClass._id}`,
          {
            method: "PUT",
            body: fd,
          }
        );
      } else {
        const payload = {
          ...formData,
          schedule: scheduleObj,
        };
        res = await fetch(
          `http://localhost:5000/api/classes/teacher/${editingClass._id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
      }

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const updated = await res.json();

      setClasses((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
      setIsEditModalOpen(false);
      setEditingClass(null);
      resetForm();
      clearFileSelection();
    } catch (err) {
      console.error("Error updating class:", err);
    }
  };

  /* -------------------------
     Delete class
  ------------------------- */
  const handleDeleteClass = async (classId) => {
    if (!confirm("Are you sure you want to delete this class?")) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/classes/teacher/${classId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      setClasses((prev) => prev.filter((c) => c._id !== classId));
      if (expandedClass === classId) setExpandedClass(null);
      // Adjust pagination: if removing last item on last page, move back a page
      const totalAfter = classes.length - 1;
      const lastPage = Math.max(1, Math.ceil(totalAfter / pageSize));
      if (currentPage > lastPage) setCurrentPage(lastPage);
    } catch (err) {
      console.error("Error deleting class:", err);
    }
  };

  /* -------------------------
     Modal open for edit (populate form)
  ------------------------- */
  const openEditModal = (classData) => {
    setEditingClass(classData);

    setFormData({
      teacherId: classData.teacherId,
      className: classData.className,
      description: classData.description || "",
      scheduleDay: classData.schedule?.[0]?.day || "Monday",
      scheduleTime: classData.schedule?.[0]?.startTime || "",
      scheduleDuration: classData.schedule?.[0]?.duration || "90",
      semester: classData.semester || "Fall",
      academicYear: classData.academicYear || "2024-2025",
      room: classData.room || "",
      maxStudents: classData.maxStudents ? String(classData.maxStudents) : "30",
    });

    setFormFiles([]); // start with no new files selected
    setIsEditModalOpen(true);
  };

  const closeModal = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setEditingClass(null);
    resetForm();
    clearFileSelection();
  };

  const resetForm = () => {
    setFormData({
      teacherId: teacherId,
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

  /* -------------------------
     Pagination helpers (client-side)
  ------------------------- */
  const totalPages = Math.max(1, Math.ceil(classes.length / pageSize));
  const paginatedClasses = classes.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const goToPage = (p) => {
    if (p < 1 || p > totalPages) return;
    setCurrentPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) return <p>Loading classes...</p>;

  return (
    <div className="teacher-classes-page" style={{ padding: 16 }}>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div className="header-left">
          <h1>📚 My Classes</h1>
          <p className="subtitle">
            {classes.length} {classes.length === 1 ? "class" : "classes"} total
          </p>
        </div>
        <button onClick={() => setIsCreateModalOpen(true)} className="btn-primary">
          <span className="plus-icon">+</span> Create New Class
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section" style={{ display: "flex", gap: 8, marginBottom: 12 }}>
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

      {/* Classes grid */}
      {classes.length === 0 ? (
        <div className="empty-state" style={{ textAlign: "center", padding: 24 }}>
          <span className="empty-icon" style={{ fontSize: 32 }}>📚</span>
          <h3>No classes found</h3>
          <p>Create your first class to get started!</p>
        </div>
      ) : (
        <>
          <div className="classes-grid" style={{ display: "grid", gap: 12 }}>
            {paginatedClasses.map((classItem) => (
              <div key={classItem._id} className="class-card" style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
                <div className="class-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div className="class-info">
                    <h3 style={{ margin: 0 }}>{classItem.className}</h3>
                    <span className={`status-badge status-${classItem.status}`} style={{ fontSize: 12 }}>
                      {classItem.status || "active"}
                    </span>
                  </div>
                  <div className="class-actions">
                    <button onClick={() => openEditModal(classItem)} className="btn-icon" title="Edit">✏️</button>
                    <button onClick={() => handleDeleteClass(classItem._id)} className="btn-icon btn-danger" title="Delete">🗑️</button>
                  </div>
                </div>

                <div className="class-card-body" style={{ marginTop: 8 }}>
                  <div className="class-meta" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {classItem.schedule?.[0]?.day && (
                      <div className="meta-item">
                        <span className="meta-icon">📅</span>
                        <span>{classItem.schedule[0].day} {classItem.schedule[0].startTime} - {classItem.schedule[0].endTime || calculateEndTime({ ...formData, scheduleTime: classItem.schedule?.[0]?.startTime, scheduleDuration: classItem.schedule?.[0]?.duration })}</span>
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
                    <div className="meta-item">
                      <span className="meta-icon">👥</span>
                      <span>{classItem.maxStudents} Students</span>
                    </div>
                  </div>

                  {classItem.description && <p className="class-description" style={{ marginTop: 8 }}>{classItem.description}</p>}

                  <button onClick={() => toggleClassExpansion(classItem._id)} className="btn-expand" style={{ marginTop: 8 }}>
                    {expandedClass === classItem._id ? '▲ Hide Details' : '▼ Show Details'}
                  </button>

                  {expandedClass === classItem._id && (
                    <div className="class-details-expanded" style={{ marginTop: 10 }}>
                      <div className="details-section">
                        <h4 style={{ marginBottom: 8 }}>📋 Class Information</h4>
                        <div className="details-grid">
                          <div className="detail-row"><strong>Duration:</strong> <span>{classItem.schedule?.[0]?.duration || 0} minutes</span></div>
                          <div className="detail-row"><strong>Max Students:</strong> <span>{classItem.maxStudents}</span></div>
                          {classItem.room && <div className="detail-row"><strong>Room:</strong> <span>{classItem.room}</span></div>}
                          {/* Attachments list if any */}
                          {classItem.attachments && classItem.attachments.length > 0 && (
                            <div style={{ marginTop: 8 }}>
                              <strong>Attachments:</strong>
                              <ul>
                                {classItem.attachments.map((att, idx) => (
                                  <li key={idx}>
                                    {/* assuming attachment is a URL; if it's an object adjust accordingly */}
                                    <a href={att} target="_blank" rel="noreferrer">Attachment {idx + 1}</a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {classes.length > pageSize && (
            <div className="pagination" style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 16 }}>
              <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>Prev</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => goToPage(p)} aria-current={currentPage === p ? "page" : undefined} style={{ fontWeight: currentPage === p ? "700" : "400" }}>
                  {p}
                </button>
              ))}
              <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
            </div>
          )}
        </>
      )}

      {/* Create / Edit Modal */}
      {(isCreateModalOpen || isEditModalOpen) && (
        <div className="modal-overlay" onClick={closeModal} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 8, maxWidth: 720, width: "100%", padding: 16 }}>
            <div className="modal-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2>{isEditModalOpen ? 'Edit Class' : 'Create New Class'}</h2>
              <button onClick={closeModal} className="close-btn">✕</button>
            </div>

            <form onSubmit={isEditModalOpen ? handleEditClass : handleCreateClass} className="modal-form" style={{ marginTop: 12 }}>
              <div className="form-group">
                <label>Class Name <span className="required">*</span></label>
                <input type="text" name="className" value={formData.className} onChange={handleInputChange} required placeholder="e.g., Mathematics 101 - Section A" />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} placeholder="Brief description of the class" />
              </div>

              <div className="form-row" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <div className="form-group" style={{ flex: "1 1 160px" }}>
                  <label>Day <span className="required">*</span></label>
                  <select name="scheduleDay" value={formData.scheduleDay} onChange={handleInputChange} required>
                    <option value="Monday">Monday</option><option value="Tuesday">Tuesday</option><option value="Wednesday">Wednesday</option><option value="Thursday">Thursday</option><option value="Friday">Friday</option><option value="Saturday">Saturday</option><option value="Sunday">Sunday</option>
                  </select>
                </div>

                <div className="form-group" style={{ flex: "1 1 140px" }}>
                  <label>Time <span className="required">*</span></label>
                  <input type="time" name="scheduleTime" value={formData.scheduleTime} onChange={handleInputChange} required />
                </div>

                <div className="form-group" style={{ flex: "1 1 140px" }}>
                  <label>Duration (min)</label>
                  <input type="number" name="scheduleDuration" value={formData.scheduleDuration} onChange={handleInputChange} min="30" step="15" />
                </div>
              </div>

              <div style={{ marginTop: 8 }}>
                <em>End time: {calculateEndTime()}</em>
              </div>

              <div className="form-row" style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <div className="form-group" style={{ flex: "1 1 200px" }}>
                  <label>Semester <span className="required">*</span></label>
                  <select name="semester" value={formData.semester} onChange={handleInputChange} required>
                    <option value="Fall">Fall</option><option value="Spring">Spring</option><option value="Summer">Summer</option>
                  </select>
                </div>

                <div className="form-group" style={{ flex: "1 1 200px" }}>
                  <label>Academic Year <span className="required">*</span></label>
                  <input type="text" name="academicYear" value={formData.academicYear} onChange={handleInputChange} required placeholder="2024-2025" />
                </div>
              </div>

              <div className="form-row" style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <div className="form-group" style={{ flex: "1 1 200px" }}>
                  <label>Room</label>
                  <input type="text" name="room" value={formData.room} onChange={handleInputChange} placeholder="e.g., Room 203" />
                </div>

                <div className="form-group" style={{ flex: "1 1 140px" }}>
                  <label>Max Students</label>
                  <input type="number" name="maxStudents" value={formData.maxStudents} onChange={handleInputChange} min="1" />
                </div>
              </div>

              {/* File upload */}
              <div style={{ marginTop: 12 }}>
                <label>Attachments (optional)</label>
                <input type="file" multiple onChange={handleFileChange} />
                {formFiles.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <strong>Files to upload:</strong>
                    <ul>
                      {formFiles.map((f, i) => <li key={i}>{f.name} ({Math.round(f.size/1024)} KB)</li>)}
                    </ul>
                    <button type="button" onClick={clearFileSelection}>Clear files</button>
                  </div>
                )}

                {/* Show existing attachments when editing */}
                {isEditModalOpen && editingClass?.attachments && editingClass.attachments.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <strong>Existing attachments (kept unless server removes them):</strong>
                    <ul>
                      {editingClass.attachments.map((att, idx) => (
                        <li key={idx}><a href={att} target="_blank" rel="noreferrer">Attachment {idx + 1}</a></li>
                      ))}
                    </ul>
                    <div style={{ fontSize: 12, color: "#555" }}>Note: uploading new files will add to existing attachments. Removing existing attachments requires backend support and UI to select removals.</div>
                  </div>
                )}
              </div>

              <div className="form-actions" style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
                <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">{isEditModalOpen ? 'Update Class' : 'Create Class'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
