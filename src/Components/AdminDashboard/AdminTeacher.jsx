import { useState, useEffect, useMemo } from "react";
import { RiDeleteBin5Line } from "react-icons/ri";
import { FaEdit } from "react-icons/fa";
import Select from "react-select";
import countryList from "react-select-country-list";
import styles from "./AdminTeacher.module.css";

export default function AdminTeacher() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [editingId, setEditingId] = useState(null);

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

  const options = useMemo(() => countryList().getData(), []);

  // Fetch teachers on load
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await fetch("http://localhost:5000/admin/teachers");
        const data = await res.json();
        if (res.ok) setTeachers(data);
      } catch (err) {
        console.error("Error fetching teachers:", err);
      }
    };
    fetchTeachers();
  }, []);

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCountryChange = (selected) => {
    setForm({ ...form, Country: selected.label });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewURL = URL.createObjectURL(file);
      setForm({ ...form, TeacherIMG: file, preview: previewURL });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (
      !form.Email ||
      !form.FullName ||
      !form.DOfB ||
      !form.Course ||
      !form.DateJoined ||
      !form.Country ||
       (!editingId && !form.TeacherIMG) // ← ADD THIS
    ) {
      alert("Please fill all fields");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("Email", form.Email);
      formData.append("FullName", form.FullName);
      formData.append("DOfB", form.DOfB);
      formData.append("Course", form.Course);
      formData.append("DateJoined", form.DateJoined);
      formData.append("Country", form.Country);
      if (form.TeacherIMG instanceof File) {
        formData.append("TeacherIMG", form.TeacherIMG);
      }

      let url = "http://localhost:5000/admin/add-teacher";
      let method = "POST";

      if (editingId) {
        url = `http://localhost:5000/admin/update-teacher/${editingId}`;
        method = "PUT";
      }

      const response = await fetch(url, { method, body: formData });
      const data = await response.json();

      if (response.ok) {
        if (editingId) {
          setTeachers((prev) =>
            prev.map((t) =>
              t.teacherId === editingId
                ? { ...t, ...form, TeacherIMG: form.preview || t.TeacherIMG }
                : t
            )
          );
          alert("Teacher updated!");
        } else {
          setTeachers((prev) => [
            ...prev,
            { ...form, teacherId: data.teacherId, TeacherIMG: form.preview },
          ]);
          alert(
            `Teacher added! Password sent to email.\nTeacher ID: ${data.teacherId}`
          );
        }

        // Reset form
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
        setIsFormOpen(false);
      } else {
        alert(data.message || "Failed to save teacher");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving teacher");
    }
  };

  const handleEdit = (teacher) => {
    setForm({
      Email: teacher.Email,
      FullName: teacher.FullName,
      DOfB: teacher.DOfB,
      Course: teacher.Course,
      DateJoined: teacher.DateJoined,
      Country: teacher.Country,
      TeacherIMG: teacher.TeacherIMG,
      preview: teacher.TeacherIMG,
    });
    setEditingId(teacher.teacherId);
    setIsFormOpen(true);
  };

  const handleDelete = async (teacher) => {
    if (!window.confirm(`Are you sure you want to delete ${teacher.FullName}?`))
      return;

    try {
      const res = await fetch(
        `http://localhost:5000/admin/teachers/${teacher.teacherId}`,
        { method: "DELETE" }
      );

      if (!res.ok) throw new Error("Failed to delete teacher");

      const data = await res.json();
      alert(data.message);

      setTeachers((prev) =>
        prev.filter((t) => t.teacherId !== teacher.teacherId)
      );
    } catch (err) {
      console.error(err);
      alert("Error deleting teacher");
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1>Teachers</h1>
        <button
          className={styles.addButton}
          onClick={() => {
            setEditingId(null);
            setIsFormOpen(true);
          }}
        >
          + Add Teacher
        </button>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div>
          <form onSubmit={handleSave}>
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
              placeholder="Course / Subject"
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
              name="TeacherIMG"
              onChange={handleImageChange}
            />

            <Select
              options={options}
              onChange={handleCountryChange}
              placeholder="Select Country"
              value={options.find((opt) => opt.label === form.Country) || null}
            />

            <button type="submit" className={styles.saveButton}>
              {editingId ? "Update" : "Save"}
            </button>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={() => {
                setIsFormOpen(false);
                setEditingId(null);
              }}
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* Teachers Table */}
      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
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
          {teachers.map((teacher) => (
            <tr key={teacher.teacherId}>
              <td>{teacher.teacherId}</td>
              <td>
                {teacher.TeacherIMG ? (
                  <img
                    src={teacher.TeacherIMG}
                    alt={teacher.FullName}
                    width="40"
                    height="40"
                    style={{ borderRadius: "50%", marginRight: "8px" }}
                  />
                ) : (
                  "No Image"
                )}
                {teacher.FullName}
              </td>
              <td>{teacher.Email}</td>
              <td>{teacher.DOfB}</td>
              <td>{teacher.Course}</td>
              <td>{teacher.DateJoined}</td>
              <td>{teacher.Country}</td>
              <td>{teacher.No_Students || 0}</td>
              <td>
                <button
                  className={styles.actionButton}
                  onClick={() => handleEdit(teacher)}
                >
                  <FaEdit />
                </button>
                <button
                  className={styles.actionButton}
                  onClick={() => handleDelete(teacher)}
                >
                  <RiDeleteBin5Line />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
