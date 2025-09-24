import { RiDeleteBin5Line } from "react-icons/ri";
import { FaEdit } from "react-icons/fa";
import { useState, useEffect, useMemo } from "react";
import Select from "react-select";
import countryList from "react-select-country-list";

export default function AdminTeacher() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [editingId, setEditingId] = useState(null); // 🔥 Track if editing or adding

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

  // ✅ Fetch teachers on load
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

  // ✅ Handle file upload & preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewURL = URL.createObjectURL(file);
      setForm({ ...form, TeacherIMG: file, preview: previewURL });
    }
  };

  // ✅ Save (Add or Update teacher)
  const handleSave = async (e) => {
    e.preventDefault();

    if (
      !form.Email ||
      !form.FullName ||
      !form.DOfB ||
      !form.Course ||
      !form.DateJoined ||
      !form.Country
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
        // 🔥 Switch to update mode
        url = `http://localhost:5000/admin/update-teacher/${editingId}`;
        method = "PUT";
      }

      const response = await fetch(url, { method, body: formData });
      const data = await response.json();

      if (response.ok) {
        if (editingId) {
          // 🔥 Update local state
          setTeachers((prev) =>
            prev.map((t) =>
              t.teacherId === editingId
                ? { ...t, ...form, TeacherIMG: form.preview || t.TeacherIMG }
                : t
            )
          );
          alert("Teacher updated!");
        } else {
          // 🔥 Add new teacher to list
          setTeachers((prev) => [
            ...prev,
            { ...form, teacherId: data.teacherId, TeacherIMG: form.preview },
          ]);
          alert(
            `Teacher added! Password sent to email.\nTeacher ID: ${data.teacherId}`
          );
        }

        // Reset
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

  // 🔥 Edit button handler
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
        `http://localhost:5000/admin/teachers/${teacher.teacherId}`, // 👈 use teacherId
        { method: "DELETE" }
      );

      if (!res.ok) throw new Error("Failed to delete teacher");

      const data = await res.json();
      alert(data.message);

      // Remove from UI
      setTeachers((prev) =>
        prev.filter((t) => t.teacherId !== teacher.teacherId)
      );
    } catch (err) {
      console.error(err);
      alert("Error deleting teacher");
    }
  };

  return (
    <>
      <h1>Teachers</h1>
      <h4
        onClick={() => {
          setEditingId(null);
          setIsFormOpen(true);
        }}
      >
        + Add Teacher
      </h4>

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
            <select
                            placeholder="Course / Subject"
                            name="Course"
                            value={form.Course}
                            onChange={handleInputChange}
                            // className={styles.formtext}
                          >
                            <option value="">Preferred Course</option>
                            <option value="AI & Machine Learning">
                              AI & Machine Learning
                            </option>
                            <option value="Cyber Security">Cyber Security</option>
                            <option value="Data Analytics">Data Analytics</option>
                            <option value="Networking">Networking</option>
                            <option value="Python">Python</option>
                            <option value="Software Engineering">
                              Software Engineering / FullStack
                            </option>
                          </select>
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

            <button type="submit">{editingId ? "Update" : "Save"}</button>
            <button
              type="button"
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

      <table border="1" cellPadding="5">
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
          {teachers.map((teacher, index) => (
            <tr key={index}>
              <td>{teacher.teacherId}</td>
              <td>
                {teacher.TeacherIMG ? (
                  <img
                    src={teacher.TeacherIMG}
                    alt={teacher.FullName}
                    width="50"
                    height="50"
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
                <button onClick={() => handleEdit(teacher)}>
                  <FaEdit />
                </button>
                <button onClick={() => handleDelete(teacher)}>
                  <RiDeleteBin5Line />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
