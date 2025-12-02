import { FileText } from "lucide-react";
import { useEffect, useState } from "react";

export default function TeacherAssignmentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterClass, setFilterClass] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);

  const [formData, setFormData] = useState({
    classId: "",
    title: "",
    description: "",
    dueDate: "",
    totalPoints: 100,
    attachments: null,
  });

  // API call supporting FormData
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
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "API request failed");
    }
    return response.json();
  };

  const formatDateTimeLocal = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60000);
    return localDate.toISOString().slice(0, 16);
  };

  useEffect(() => {
    fetchClasses();
    fetchAssignments();
  }, []);

  const fetchClasses = async () => {
    try {
      const data = await apiCall("/classes/teacher");
      setClasses(data);
    } catch (err) {
      console.error("Error fetching classes:", err);
      alert(err.message);
    }
  };

  const fetchAssignments = async (classId = "") => {
    try {
      setLoading(true);
      let url = "/teachassignments/teacher";
      if (classId) url += `?classId=${classId}`;
      const data = await apiCall(url);
      setAssignments(data);
    } catch (err) {
      console.error("Error fetching assignments:", err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

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
      payload.append("classId", classId);
      payload.append("title", title);
      payload.append("description", description);
      payload.append("dueDate", dueDate);
      payload.append("totalPoints", totalPoints);
      if (attachments) payload.append("attachments", attachments);

      let data;
      if (editingAssignment) {
        data = await apiCall(`/teachassignments/${editingAssignment._id}`, "PUT", payload);
        setAssignments(assignments.map(a => a._id === data._id ? data : a));
      } else {
        data = await apiCall("/teachassignments", "POST", payload);
        setAssignments([data, ...assignments]);
      }

      closeModal();
    } catch (err) {
      console.error(err);
      alert("Error saving assignment: " + err.message);
    }
  };

  const handleDeleteAssignment = async (id) => {
    if (!confirm("Are you sure you want to delete this assignment?")) return;
    try {
      await apiCall(`/teachassignments/${id}`, "DELETE");
      setAssignments(assignments.filter(a => a._id !== id));
    } catch (err) {
      console.error(err);
      alert("Error deleting assignment: " + err.message);
    }
  };

  const filteredAssignments = filterClass
    ? assignments.filter(a => a.classId._id === filterClass)
    : assignments;

  if (loading) return <div>Loading assignments...</div>;

  return (
    <div className="teacher-assignments-page">
      <h1 className="page-title">
        <FileText size={32} /> My Assignments
      </h1>

      <div className="assignments-controls">
        <select
          value={filterClass}
          onChange={(e) => {
            setFilterClass(e.target.value);
            fetchAssignments(e.target.value);
          }}
        >
          <option value="">All Classes</option>
          {classes.map(cls => <option key={cls._id} value={cls._id}>{cls.className}</option>)}
        </select>

        <button onClick={() => openModal()}>Create Assignment</button>
      </div>

      {filteredAssignments.length === 0 ? (
        <div>No assignments found</div>
      ) : (
        filteredAssignments.map(a => (
          <div key={a._id} className="assignment-card">
            <h3>{a.title}</h3>
            <p>{a.description}</p>
            <p>
              Class: {a.classId.className} | Due: {new Date(a.dueDate).toLocaleString()} | Points: {a.totalPoints}
            </p>
            <div className="assignment-actions">
              <button onClick={() => openModal(a)}>Edit</button>
              <button onClick={() => handleDeleteAssignment(a._id)}>Delete</button>
            </div>
          </div>
        ))
      )}

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
