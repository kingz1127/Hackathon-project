import { useState, useEffect, useMemo } from "react";
import Select from "react-select";
import countryList from "react-select-country-list";

export default function AdminTeacher() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [form, setForm] = useState({
    Email: "",
    FullName: "",
    DOfB: "",
    Course: "",
    DateJoined: "",
    TeacherIMG: "",
    Country: "",
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

  const handleSave = async (e) => {
    e.preventDefault();

    if (
      !form.Email ||
      !form.FullName ||
      !form.DOfB ||
      !form.Course ||
      !form.DateJoined ||
      !form.TeacherIMG ||
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
      formData.append("TeacherIMG", form.TeacherIMG); // real file

      const response = await fetch("http://localhost:5000/admin/add-teacher", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        alert(
          `Teacher added! Password sent to email.\nTeacher ID: ${data.teacherId}`
        );

        setTeachers((prev) => [
          ...prev,
          { ...form, TeacherIMG: form.preview }, // show preview immediately
        ]);

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
        setIsFormOpen(false);
      } else {
        alert(data.message || "Failed to add teacher");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving teacher");
    }
  };

  return (
    <>
      <h1>Teachers</h1>
      <h4 onClick={() => setIsFormOpen(true)}>+ Add Teacher</h4>

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

            {/* ✅ File input for image */}
            <input
              type="file"
              accept="image/*"
              name="TeacherIMG"
              onChange={handleImageChange}
            />

            {/* ✅ Searchable Country Select */}
            <Select
              options={options}
              onChange={handleCountryChange}
              placeholder="Select Country"
              value={options.find((opt) => opt.label === form.Country) || null}
            />

            <button type="submit">Save</button>
            <button type="button" onClick={() => setIsFormOpen(false)}>
              Cancel
            </button>
          </form>
        </div>
      )}

      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>Teacher img</th>
            <th>Fullname</th>
            <th>Email</th>
            <th>DOB</th>
            <th>Course</th>
            <th>Date Joined</th>
            <th>Country</th>
            <th>No_Students</th>
          </tr>
        </thead>
        <tbody>
          {teachers.map((teacher, index) => (
            <tr key={index}>
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
              </td>
              <td>{teacher.FullName}</td>
              <td>{teacher.Email}</td>
              <td>{teacher.DOfB}</td>
              <td>{teacher.Course}</td>
              <td>{teacher.DateJoined}</td>
              <td>{teacher.Country}</td>
              <td></td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
