import { FileText } from "lucide-react";
import { useEffect, useState } from "react";

const API_BASE_URL = "http://localhost:5000/api"; // backend base URL
const PAGE_SIZE = 5; // assignments per page

export default function TeacherAssignmentsPage() {
const [assignments, setAssignments] = useState([]);
const [classes, setClasses] = useState([]);
const [loading, setLoading] = useState(true);
const [filterClass, setFilterClass] = useState("");
const [isModalOpen, setIsModalOpen] = useState(false);
const [editingAssignment, setEditingAssignment] = useState(null);
const [currentPage, setCurrentPage] = useState(1);

const [formData, setFormData] = useState({
classId: "",
title: "",
description: "",
dueDate: "",
totalPoints: 100,
attachments: null,
});
// ======== Get teacherId from localStorage ========
const teacherId = localStorage.getItem("teacherId"); // plain string
if (!teacherId) console.error("teacherId not found in localStorage");

// ======== Generic API call ========
const apiCall = async (url, method = "GET", data = null) => {
  const options = { method };

  if (data) {
    if (data instanceof FormData) {
      options.body = data;
    } else {
      options.body = JSON.stringify(data);
      options.headers = { "Content-Type": "application/json" };
    }
  }

  const response = await fetch(`${API_BASE_URL}${url}`, options);
  const text = await response.text();

  try {
    return JSON.parse(text); // if backend returns JSON
  } catch {
    console.warn("Response not JSON, returning raw text:", text);
    return text; // fallback
  }
};


const formatDateTimeLocal = (dateStr) => {
if (!dateStr) return "";
const date = new Date(dateStr);
const offset = date.getTimezoneOffset();
const localDate = new Date(date.getTime() - offset * 60000);
return localDate.toISOString().slice(0, 16);
};

// ======== Fetch classes for this teacher ========
const fetchClasses = async () => {
if (!teacherId) return;
try {
const data = await apiCall(`/classes/teacher/${teacherId}`);
setClasses(data);
} catch (err) {
console.error("Error fetching classes:", err);
alert(err.message);
}
};

// ======== Fetch assignments for a class ========
const fetchAssignments = async (classId) => {
  if (!teacherId) return;
  if (!classId) return;

  try {
    setLoading(true);
    const url = `/assignments/teacher/class/${classId}?teacherId=${teacherId}`;
    const data = await apiCall(url);
    setAssignments(data);
    setCurrentPage(1);
  } catch (err) {
    console.error("Error fetching assignments:", err);
    alert(err.message);
  } finally {
    setLoading(false);
  }
};

// ======== Load classes on mount ========
useEffect(() => {
  const load = async () => {
    await fetchClasses(); // fetch classes first
  };
  load();
}, []);

// ======== Fetch assignments for the first class once classes are loaded ========
useEffect(() => {
  if (classes.length > 0) {
    fetchAssignments(classes[0]._id); // fetch assignments for the first class
  }
}, [classes]); // runs whenever classes array changes


const handleInputChange = (e) => {
const { name, value, files } = e.target;
setFormData((prev) => ({
...prev,
[name]: files ? files[0] : value,
}));
};

const openModal = (assignment = null) => {
if (assignment) {
setEditingAssignment(assignment);
setFormData({
classId: assignment.classId._id,
title: assignment.title,
description: assignment.description,
dueDate: formatDateTimeLocal(assignment.dueDate),
totalPoints: assignment.totalPoints,
attachments: null,
});
} else {
setEditingAssignment(null);
setFormData({
classId: "",
title: "",
description: "",
dueDate: "",
totalPoints: 100,
attachments: null,
});
}
setIsModalOpen(true);
};

const closeModal = () => setIsModalOpen(false);

const handleSaveAssignment = async () => {
const { classId, title, description, dueDate, totalPoints, attachments } = formData;

if (!classId || !title || !description || !dueDate || totalPoints <= 0) {
  alert("Please fill all required fields and ensure total points > 0");
  return;
}

try {
  const payload = new FormData();
  payload.append("teacherId", teacherId);
  payload.append("classId", classId);
  payload.append("title", title);
  payload.append("description", description);
  payload.append("dueDate", dueDate);
  payload.append("totalPoints", totalPoints);
  if (attachments) payload.append("attachments", attachments);

  let data;
  if (editingAssignment) {
    // PUT not implemented in backend yet
    alert("Editing assignments not yet supported in backend");
    return;
  } else {
    data = await apiCall("/assignments", "POST", payload);
    setAssignments([data, ...assignments]);
  }

  closeModal();
} catch (err) {
  console.error("Error saving assignment:", err);
  alert("Error saving assignment: " + err.message);
}
};

if (loading) return <div>Loading assignments...</div>;


// ======== Pagination logic ========
const paginatedAssignments = () => {
  const filtered = filterClass
    ? assignments.filter(a => a.classId._id === filterClass)
    : assignments;

  const start = (currentPage - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  return filtered.slice(start, end);
};

const totalPages = Math.ceil(
  (filterClass
    ? assignments.filter(a => a.classId._id === filterClass).length
    : assignments.length) / PAGE_SIZE
);

return ( <div className="teacher-assignments-page"> <h1 className="page-title"> <FileText size={32} /> My Assignments </h1>

  {/* Controls */}
  <div className="assignments-controls">
    <select
      value={filterClass}
      onChange={(e) => {
        setFilterClass(e.target.value);
        fetchAssignments(e.target.value);
      }}
    >
      <option value="">All Classes</option>
      {classes.map(cls => (
        <option key={cls._id} value={cls._id}>{cls.className}</option>
      ))}
    </select>

    <button onClick={() => openModal()}>Create Assignment</button>
  </div>

  {/* Assignment List */}
  {paginatedAssignments().length === 0 ? (
    <div>No assignments found</div>
  ) : (
    paginatedAssignments().map(a => (
      <div key={a._id} className="assignment-card">
        <h3>{a.title}</h3>
        <p>{a.description}</p>
        <p>
          Class: {a.classId.className} | Due: {new Date(a.dueDate).toLocaleString()} | Points: {a.totalPoints}
        </p>
        {a.attachments && (
          <p>
            Attachment: <a href={`${API_BASE_URL}/uploads/${a.attachments}`} target="_blank" rel="noreferrer">{a.attachments}</a>
          </p>
        )}
        <div className="assignment-actions">
          <button onClick={() => openModal(a)}>Edit</button>
          <button onClick={() => handleDeleteAssignment(a._id)}>Delete</button>
        </div>
      </div>
    ))
  )}

  {/* Pagination */}
  {totalPages > 1 && (
    <div className="pagination">
      <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>
        Prev
      </button>
      <span>Page {currentPage} of {totalPages}</span>
      <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>
        Next
      </button>
    </div>
  )}

  {/* Modal */}
  {isModalOpen && (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{editingAssignment ? "Edit Assignment" : "Create Assignment"}</h2>
        <div className="modal-form">
          <select name="classId" value={formData.classId} onChange={handleInputChange} required>
            <option value="">Select Class</option>
            {classes.map(cls => <option key={cls._id} value={cls._id}>{cls.className}</option>)}
          </select>
          <input type="text" name="title" placeholder="Title" value={formData.title} onChange={handleInputChange} required />
          <textarea name="description" placeholder="Description" value={formData.description} onChange={handleInputChange} />
          <input type="datetime-local" name="dueDate" value={formData.dueDate} onChange={handleInputChange} required />
          <input type="number" name="totalPoints" value={formData.totalPoints} onChange={handleInputChange} min={1} />
          <input type="file" name="attachments" onChange={handleInputChange} />
        </div>
        <div className="modal-actions">
          <button onClick={closeModal}>Cancel</button>
          <button onClick={handleSaveAssignment}>{editingAssignment ? "Update" : "Create"}</button>
        </div>
      </div>
    </div>
  )}
</div>
);
}
