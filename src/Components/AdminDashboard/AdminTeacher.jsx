import { useState } from "react";

export default function AdminTeacher() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState({
    Email: "",
    FullName: "",
    DOfB: "",
    Course: "",
    DateJoined: "",
  });

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();

    // Validate fields
    if (
      !form.Email ||
      !form.FullName ||
      !form.DOfB ||
      !form.Course ||
      !form.DateJoined
    ) {
      alert("Please fill all fields");
      return;
    }

    try {
      // ✅ Updated fetch URL to match backend
      const response = await fetch("http://localhost:5000/admin/add-teacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Email: form.Email,
          FullName: form.FullName,
          DOfB: form.DOfB,
          Course: form.Course,
          DateJoined: form.DateJoined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(
          `Teacher added! Password sent to email.\nTeacher ID: ${data.teacherId}`
        );

        // Reset form
        setForm({
          Email: "",
          FullName: "",
          DOfB: "",
          Course: "",
          DateJoined: "",
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
              placeholder="DOB"
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
              placeholder="Date joined"
              value={form.DateJoined}
              onChange={handleInputChange}
            />
            <button type="submit">Save</button>
            <button type="button" onClick={() => setIsFormOpen(false)}>
              Cancel
            </button>
          </form>
        </div>
      )}
    </>
  );
}
