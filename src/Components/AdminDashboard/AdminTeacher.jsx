import { useState, useEffect, useMemo } from "react";
import { RiDeleteBin5Line } from "react-icons/ri";
import { FaEdit, FaEye } from "react-icons/fa";
import Select from "react-select";
import countryList from "react-select-country-list";
import styles from "./AdminTeacher.module.css";

export default function AdminTeacher() {
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const options = useMemo(() => countryList().getData(), []);

  const [form, setForm] = useState({
    Email: "",
    FullName: "",
    DOfB: "",
    Course: "",
    DateJoined: "",
    TeacherIMG: "",
    Country: "",
    preview: "",
  });

  const resetForm = () => {
    setForm({
      Email: "",
      FullName: "",
      DOfB: "",
      Course: "",
      DateJoined: "",
      TeacherIMG: "",
      Country: "",
      preview: "",
    });
    setEditingId(null);
  };

  // Fetch teachers
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await fetch("http://localhost:5000/admin/teachers");
        const data = await res.json();
        if (Array.isArray(data)) setTeachers(data);
      } catch (err) {
        console.error("Error fetching teachers:", err);
      }
    };
    fetchTeachers();
  }, []);

  const handleInputChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleCountryChange = (selected) =>
    setForm((prev) => ({ ...prev, Country: selected?.label || "" }));

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewURL = URL.createObjectURL(file);
      setForm((prev) => ({ ...prev, TeacherIMG: file, preview: previewURL }));
    }
  };

  // Save Teacher
  const handleSave = async (e) => {
    e.preventDefault();
    const { Email, FullName, DOfB, Course, DateJoined, Country } = form;

    if (!Email || !FullName || !DOfB || !Course || !DateJoined || !Country) {
      return alert("Please fill all fields");
    }

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });

      let url = "http://localhost:5000/admin/add-teacher";
      let method = "POST";
      if (editingId) {
        url = `http://localhost:5000/admin/update-teacher/${editingId}`;
        method = "PUT";
      }

      const res = await fetch(url, { method, body: formData });
      const data = await res.json();

      if (editingId) {
        setTeachers((prev) =>
          prev.map((t) =>
            t.teacherId === editingId
              ? { ...t, ...form, TeacherIMG: form.preview || t.TeacherIMG }
              : t
          )
        );
        alert("Teacher updated");
      } else {
        setTeachers((prev) => [
          ...prev,
          {
            ...form,
            teacherId: data.teacherId || `T${Date.now()}`,
            TeacherIMG: form.preview, // show preview immediately
          },
        ]);
        alert("Teacher added");
      }

      resetForm();
      setIsFormOpen(false);
    } catch (err) {
      console.error(err);
      alert("Error saving teacher");
    }
  };

  const handleEdit = (teacher) => {
    setForm({
      Email: teacher.Email || "",
      FullName: teacher.FullName || "",
      DOfB: teacher.DOfB || "",
      Course: teacher.Course || "",
      DateJoined: teacher.DateJoined || "",
      Country: teacher.Country || "",
      TeacherIMG: teacher.TeacherIMG || "",
      preview: teacher.TeacherIMG || "",
    });
    setEditingId(teacher.teacherId);
    setIsFormOpen(true);
  };

  const handleDelete = async (teacher) => {
    if (!window.confirm(`Delete ${teacher.FullName}?`)) return;
    try {
      const res = await fetch(
        `http://localhost:5000/admin/teachers/${teacher.teacherId}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      alert(data.message || "Deleted");
      setTeachers((prev) =>
        prev.filter((t) => t.teacherId !== teacher.teacherId)
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleView = async (teacher) => {
    setSelectedTeacher(teacher);
    try {
      const res = await fetch(
        `http://localhost:5000/admin/teachers/${teacher.teacherId}/students`
      );
      const data = await res.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      setStudents(teacher.students || []);
    }
    setIsViewOpen(true);
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1>Teachers</h1>
        <button
          className={styles.addButton}
          onClick={() => {
            resetForm();
            setIsFormOpen(true);
          }}
        >
          + Add Teacher
        </button>
      </div>

      {/* Teachers Table */}
      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            {/* <th>Photo</th> */}
            <th>Fullname</th>
            <th>Email</th>
            <th>DOB</th>
            <th>Course</th>
            <th>Date Joined</th>
            <th>Country</th>
            <th>No_Students</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {teachers.map((t) => (
            <tr key={t.teacherId}>
              <td>{t.teacherId}</td>
              <td className={styles.tdimgname}>

                <img
                  src={t.TeacherIMG || "/default.png"}
                  alt={t.FullName}
                />
                <p>{t.FullName}</p>    
              </td>
              
              <td>{t.Email}</td>
              <td>{t.DOfB}</td>
              <td>{t.Course}</td>
              <td>{t.DateJoined}</td>
              <td>{t.Country}</td>
              <td>{t.No_Students || 0}</td>
              <td>
                <button
                  className={styles.actionButton}
                  onClick={() => handleEdit(t)}
                >
                  <FaEdit />
                </button>
                <button
                  className={styles.actionButton}
                  onClick={() => handleDelete(t)}
                >
                  <RiDeleteBin5Line />
                </button>
                <button
                  className={styles.actionButton}
                  onClick={() => handleView(t)}
                >
                  <FaEye style={{ color: "blue" }} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add/Edit Modal */}
      {isFormOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{editingId ? "Edit Teacher" : "Add Teacher"}</h2>
              <button
                className={styles.closeButton}
                onClick={() => setIsFormOpen(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSave} className={styles.form}>
              <input
                type="email"
                name="Email"
                placeholder="Email"
                value={form.Email}
                onChange={handleInputChange}
              />
              <input
                type="text"
                name="FullName"
                placeholder="Full Name"
                value={form.FullName}
                onChange={handleInputChange}
              />
              <input
                type="date"
                name="DOfB"
                value={form.DOfB}
                onChange={handleInputChange}
              />
              <input
                type="text"
                name="Course"
                placeholder="Course"
                value={form.Course}
                onChange={handleInputChange}
              />
              <input
                type="datetime-local"
                name="DateJoined"
                value={form.DateJoined}
                onChange={handleInputChange}
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />

              {form.preview && (
                <img
                  src={form.preview}
                  alt="Preview"
                  width="100"
                  style={{ marginTop: 8, borderRadius: "8px" }}
                />
              )}

              <Select
                options={options}
                onChange={handleCountryChange}
                placeholder="Select Country"
                value={
                  options.find((opt) => opt.label === form.Country) || null
                }
              />

              <button type="submit" className={styles.saveButton}>
                {editingId ? "Update" : "Save"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {isViewOpen && selectedTeacher && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Teacher Details</h2>
              <button
                className={styles.closeButton}
                onClick={() => setIsViewOpen(false)}
              >
                ×
              </button>
            </div>
            <div className={styles.teacherDetail}>
              <img
                src={selectedTeacher.TeacherIMG || "/default.png"}
                alt={selectedTeacher.FullName}
                style={{ borderRadius: "50%" }}
              />
              <p>
                <b>ID:</b> {selectedTeacher.teacherId}
              </p>
              <p>
                <b>Name:</b> {selectedTeacher.FullName}
              </p>
              <p>
                <b>Email:</b> {selectedTeacher.Email}
              </p>
              <p>
                <b>DOB:</b> {selectedTeacher.DOfB}
              </p>
              <p>
                <b>Course:</b> {selectedTeacher.Course}
              </p>
              <p>
                <b>Date Joined:</b> {selectedTeacher.DateJoined}
              </p>
              <p>
                <b>Country:</b> {selectedTeacher.Country}
              </p>

              <h3>Students</h3>
              <ul>
                
                {students.length > 0 ? (
                  students.map((s) => (
                    <li key={s.studentId || s.Email}>{s.FullName}</li>
                  ))
                ) : (
                  <p>No students assigned!</p>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}