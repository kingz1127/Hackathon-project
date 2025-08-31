import React, { useMemo, useState, useEffect } from "react";
import Select from "react-select";
import countryList from "react-select-country-list";

export default function AdminStudent() {
  const [students, setStudents] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [emailStatus, setEmailStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    Email: "",
    FullName: "",
    DOfB: "",
    Course: "",
    DateJoined: "",
    StudentIMG: null,
    Country: "",
    StudentID: "",
    GradeLevel: "",
    Guardian: "",
    preview: "",
  });

  const options = useMemo(() => countryList().getData(), []);

  // Fetch students from backend on component load
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch("http://localhost:5000/admin/students");
      const data = await response.json();
      if (response.ok) {
        setStudents(data);
      } else {
        console.error("Failed to fetch students:", data.message);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewURL = URL.createObjectURL(file);
      setForm((prev) => ({
        ...prev,
        StudentIMG: file,
        preview: previewURL,
      }));
    }
  };

  const handleCountryChange = (selectedOption) => {
    setForm((prev) => ({
      ...prev,
      Country: selectedOption ? selectedOption.label : "",
    }));
  };

  const handleSave = async () => {
    if (
      !form.FullName ||
      !form.Email ||
      !form.DOfB ||
      !form.Course ||
      !form.GradeLevel ||
      !form.Guardian ||
      !form.DateJoined ||
      !form.Country ||
      !form.StudentIMG
    ) {
      setEmailStatus("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    setEmailStatus("Processing student registration...");

    try {
      const formData = new FormData();
      formData.append("Email", form.Email);
      formData.append("FullName", form.FullName);
      formData.append("DOfB", form.DOfB);
      formData.append("Course", form.Course);
      formData.append("GradeLevel", form.GradeLevel);
      formData.append("Guardian", form.Guardian);
      formData.append("DateJoined", form.DateJoined);
      formData.append("Country", form.Country);
      formData.append("StudentIMG", form.StudentIMG);

      const response = await fetch("http://localhost:5000/admin/add-student", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setEmailStatus(
          `✅ Student registered successfully! ${
            data.emailSent
              ? `Welcome email sent to ${form.Email}`
              : "Email not sent (check configuration)"
          }`
        );

        // Refresh students list from backend
        await fetchStudents();

        // Reset form
        setForm({
          Email: "",
          FullName: "",
          DOfB: "",
          Course: "",
          DateJoined: "",
          StudentIMG: null,
          Country: "",
          StudentID: "",
          GradeLevel: "",
          Guardian: "",
          preview: "",
        });

        // Close form after 3 seconds
        setTimeout(() => {
          setIsFormOpen(false);
          setEmailStatus("");
        }, 3000);
      } else {
        throw new Error(data.message || "Failed to register student");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setEmailStatus(`❌ Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (studentId, index) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        const response = await fetch(
          `http://localhost:5000/admin/students/${studentId}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          // Remove from local state immediately
          setStudents((prev) => prev.filter((_, i) => i !== index));
          setEmailStatus("✅ Student deleted successfully");
          setTimeout(() => setEmailStatus(""), 3000);
        } else {
          const data = await response.json();
          throw new Error(data.message || "Failed to delete student");
        }
      } catch (error) {
        console.error("Delete error:", error);
        setEmailStatus(`❌ Error: ${error.message}`);
        setTimeout(() => setEmailStatus(""), 3000);
      }
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ color: "#333", marginBottom: "10px" }}>
          Student Management
        </h2>
        <h4
          onClick={() => setIsFormOpen(true)}
          style={{
            cursor: "pointer",
            color: "#007bff",
            background: "#f8f9fa",
            padding: "10px 15px",
            border: "1px solid #dee2e6",
            borderRadius: "5px",
            display: "inline-block",
            margin: 0,
            transition: "all 0.3s ease",
          }}
          onMouseOver={(e) => (e.target.style.background = "#e9ecef")}
          onMouseOut={(e) => (e.target.style.background = "#f8f9fa")}
        >
          + Add Student
        </h4>
      </div>

      {emailStatus && (
        <div
          style={{
            padding: "10px",
            margin: "10px 0",
            borderRadius: "4px",
            background: emailStatus.includes("✅")
              ? "#d4edda"
              : emailStatus.includes("❌")
              ? "#f8d7da"
              : "#d1ecf1",
            border: `1px solid ${
              emailStatus.includes("✅")
                ? "#c3e6cb"
                : emailStatus.includes("❌")
                ? "#f5c6cb"
                : "#bee5eb"
            }`,
            color: emailStatus.includes("✅")
              ? "#155724"
              : emailStatus.includes("❌")
              ? "#721c24"
              : "#0c5460",
            fontSize: "14px",
          }}
        >
          {emailStatus}
        </div>
      )}

      {isFormOpen && (
        <div
          style={{
            background: "#f8f9fa",
            border: "1px solid #dee2e6",
            borderRadius: "8px",
            padding: "20px",
            marginBottom: "20px",
          }}
        >
          <h3 style={{ marginTop: 0, color: "#333" }}>Add New Student</h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "15px",
            }}
          >
            <input
              type="email"
              name="Email"
              placeholder="Email *"
              value={form.Email}
              onChange={handleInputChange}
              required
              style={{
                padding: "8px 12px",
                border: "1px solid #ced4da",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            />
            <input
              type="text"
              name="FullName"
              placeholder="Full Name *"
              value={form.FullName}
              onChange={handleInputChange}
              required
              style={{
                padding: "8px 12px",
                border: "1px solid #ced4da",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            />
            <div>
              <label
                style={{
                  fontSize: "12px",
                  color: "#666",
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                Date of Birth *
              </label>
              <input
                type="date"
                name="DOfB"
                value={form.DOfB}
                onChange={handleInputChange}
                required
                style={{
                  padding: "8px 12px",
                  border: "1px solid #ced4da",
                  borderRadius: "4px",
                  fontSize: "14px",
                  width: "100%",
                }}
              />
            </div>
            <input
              type="text"
              name="Course"
              placeholder="Course / Program *"
              value={form.Course}
              onChange={handleInputChange}
              required
              style={{
                padding: "8px 12px",
                border: "1px solid #ced4da",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            />
            <input
              type="text"
              name="GradeLevel"
              placeholder="Grade Level *"
              value={form.GradeLevel}
              onChange={handleInputChange}
              required
              style={{
                padding: "8px 12px",
                border: "1px solid #ced4da",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            />
            <input
              type="text"
              name="Guardian"
              placeholder="Guardian/Parent Name *"
              value={form.Guardian}
              onChange={handleInputChange}
              required
              style={{
                padding: "8px 12px",
                border: "1px solid #ced4da",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            />
            <div>
              <label
                style={{
                  fontSize: "12px",
                  color: "#666",
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                Date Enrolled *
              </label>
              <input
                type="datetime-local"
                name="DateJoined"
                value={form.DateJoined}
                onChange={handleInputChange}
                required
                style={{
                  padding: "8px 12px",
                  border: "1px solid #ced4da",
                  borderRadius: "4px",
                  fontSize: "14px",
                  width: "100%",
                }}
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: "12px",
                  color: "#666",
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                Student Photo *
              </label>
              <input
                type="file"
                accept="image/*"
                name="StudentIMG"
                onChange={handleImageChange}
                required
                style={{
                  padding: "8px 12px",
                  border: "1px solid #ced4da",
                  borderRadius: "4px",
                  fontSize: "14px",
                  width: "100%",
                }}
              />
              {form.preview && (
                <img
                  src={form.preview}
                  alt="Preview"
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "4px",
                    marginTop: "8px",
                    objectFit: "cover",
                  }}
                />
              )}
            </div>
            <div>
              <label
                style={{
                  fontSize: "12px",
                  color: "#666",
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                Country *
              </label>
              <Select
                options={options}
                onChange={handleCountryChange}
                placeholder="Select Country"
                value={
                  options.find((opt) => opt.label === form.Country) || null
                }
                styles={{
                  control: (base) => ({
                    ...base,
                    minHeight: "38px",
                    border: "1px solid #ced4da",
                    borderRadius: "4px",
                  }),
                }}
              />
            </div>
            <div
              style={{
                gridColumn: "1 / -1",
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                onClick={handleSave}
                disabled={isLoading}
                style={{
                  background: isLoading ? "#6c757d" : "#28a745",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "4px",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  fontSize: "14px",
                  opacity: isLoading ? 0.7 : 1,
                }}
              >
                {isLoading ? "Processing..." : "Save Student"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsFormOpen(false);
                  setEmailStatus("");
                }}
                disabled={isLoading}
                style={{
                  background: "#6c757d",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "4px",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  fontSize: "14px",
                  opacity: isLoading ? 0.7 : 1,
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>Photo</th>
              <th>Student ID</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>DOB</th>
              <th>Course</th>
              <th>Grade</th>
              <th>Guardian</th>
              <th>Date Enrolled</th>
              <th>Country</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan="11">
                  No students found. Click "Add Student" to get started.
                </td>
              </tr>
            ) : (
              students.map((student, index) => (
                <tr key={student._id || index}>
                  <td>
                    {student.StudentIMG ? (
                      <img
                        src={student.StudentIMG}
                        alt={student.FullName}
                        style={{
                          width: "50px",
                          height: "50px",
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div>No Photo</div>
                    )}
                  </td>
                  <td>{student.studentId}</td>
                  <td>{student.FullName}</td>
                  <td>{student.Email}</td>
                  <td>{student.DOfB}</td>
                  <td>{student.Course}</td>
                  <td>{student.GradeLevel}</td>
                  <td>{student.Guardian}</td>
                  <td>
                    {student.DateJoined
                      ? new Date(student.DateJoined).toLocaleDateString()
                      : ""}
                  </td>
                  <td>{student.Country}</td>
                  <td style={{ padding: "8px", border: "1px solid #dee2e6" }}>
                    <button
                      onClick={() => handleDelete(student.studentId, index)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
