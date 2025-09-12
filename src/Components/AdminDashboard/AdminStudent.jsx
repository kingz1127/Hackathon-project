import React, { useMemo, useState, useEffect } from "react";
import { FaEdit } from "react-icons/fa";
import Select from "react-select";
import countryList from "react-select-country-list";
import styles from "./AdminStudent.module.css";

export default function AdminStudent() {
  const [students, setStudents] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [emailStatus, setEmailStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState(null); // ✅ track editing

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
    PhoneNumber: "",
    GuardianPhoneNumber: "",
    StateOfOrigin: "",
    Address: "",
    Gender: "",
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
      !form.StudentIMG ||
      !form.PhoneNumber ||
      !form.GuardianPhoneNumber ||
      !form.StateOfOrigin ||
      !form.Address ||
      !form.Gender
    ) {
      setEmailStatus("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    setEmailStatus(
      editingId ? "Updating student..." : "Processing student registration..."
    );

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
      formData.append("PhoneNumber", form.PhoneNumber);
      formData.append("GuardianPhoneNumber", form.GuardianPhoneNumber);
      formData.append("StateOfOrigin", form.StateOfOrigin);
      formData.append("Address", form.Address);
      formData.append("Gender", form.Gender);
      let response;
      if (editingId) {
        // ✅ UPDATE student
        response = await fetch(
          `http://localhost:5000/admin/students/${editingId}`,
          {
            method: "PUT",
            body: formData,
          }
        );
      } else {
        // ✅ ADD student
        response = await fetch("http://localhost:5000/admin/add-student", {
          method: "POST",
          body: formData,
        });
      }

      const data = await response.json();

      if (response.ok) {
        setEmailStatus(
          editingId
            ? "✅ Student updated successfully!"
            : `✅ Student registered successfully! ${
                data.emailSent
                  ? `Welcome email sent to ${form.Email}`
                  : "Email not sent (check configuration)"
              }`
        );

        // Refresh students list
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
          PhoneNumber: "",
          GuardianPhoneNumber: "",
          StateOfOrigin: "",
          Address: "",
          Gender: "",
          preview: "",
        });
        setEditingId(null);

        // Close form after 3 seconds
        setTimeout(() => {
          setIsFormOpen(false);
          setEmailStatus("");
        }, 3000);
      } else {
        throw new Error(data.message || "Failed to save student");
      }
    } catch (error) {
      console.error("Save error:", error);
      setEmailStatus(`❌ Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 🔥 Edit button handler
  const handleEdit = (student) => {
    setForm({
      Email: student.Email,
      FullName: student.FullName,
      DOfB: student.DOfB,
      Course: student.Course,
      GradeLevel: student.GradeLevel,
      Guardian: student.Guardian,
      DateJoined: student.DateJoined,
      Country: student.Country,
      StudentIMG: student.StudentIMG,
      preview: student.StudentIMG,
      StudentID: student.studentId,
      PhoneNumber: student.PhoneNumber,
      GuardianPhoneNumber: student.GuardianPhoneNumber,
      StateOfOrigin: student.StateOfOrigin,
      Address: student.Address,
      Gender: student.Gender,
    });
    setEditingId(student.studentId); // ✅ track editing
    setIsFormOpen(true);
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
        <h2 style={{ color: "#333", marginBottom: "10px" }}>Students</h2>
        <h4 className={styles.add} onClick={() => setIsFormOpen(true)}>
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
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div className={styles.openModal}>
            <div>
              <div className={styles.openModal1}>
                <input
                  type="email"
                  name="Email"
                  placeholder="Email"
                  value={form.Email}
                  onChange={handleInputChange}
                  required
                />
                <input
                  type="text"
                  name="FullName"
                  placeholder="Full Name"
                  value={form.FullName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className={styles.openModal2}>
                <label className={styles.openModal2v1}>
                  D0B:{" "}
                  <input
                    type="date"
                    name="DOfB"
                    value={form.DOfB}
                    onChange={handleInputChange}
                    required
                  />
                </label>

                <input
                  className={styles.openModal2v2}
                  type="number"
                  name="PhoneNumber"
                  placeholder="Phone number"
                  value={form.PhoneNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className={styles.openModal1}>
                <input
                  type="text"
                  name="Course"
                  placeholder="Course"
                  value={form.Course}
                  onChange={handleInputChange}
                  required
                />
                <input
                  type="text"
                  name="GradeLevel"
                  placeholder="Grade Level"
                  value={form.GradeLevel}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className={styles.genders}>
                <label>Gender: </label>
                <select
                  name="Gender"
                  value={form.Gender}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div className={styles.openModal1}>
                <input
                  type="text"
                  name="Guardian"
                  placeholder="Guardian/Parent Name"
                  value={form.Guardian}
                  onChange={handleInputChange}
                  required
                />
                <input
                  type="number"
                  name="GuardianPhoneNumber" // ✅ added
                  placeholder="Guardian Phone Number"
                  value={form.GuardianPhoneNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className={styles.genders}>
                <label>Date Enrolled: </label>
                <input
                  type="datetime-local"
                  name="DateJoined"
                  value={form.DateJoined}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className={styles.openModal1}>
                <input
                  type="text"
                  name="Address"
                  placeholder="Address"
                  value={form.Address}
                  onChange={handleInputChange}
                  required
                />
                <input
                  type="text"
                  name="StateOfOrigin"
                  placeholder="State Of Origin"
                  value={form.StateOfOrigin}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className={styles.imgpre}>
                <label>Student Photo:</label>
                <input
                  type="file"
                  accept="image/*"
                  name="StudentIMG"
                  onChange={handleImageChange}
                  required={!editingId} // photo only required when adding
                />
                {form.preview && (
                  <img
                    className={styles.previewimg}
                    src={form.preview}
                    alt="Preview"
                    // style={{ width: "240px", height: "240" }}
                  />
                )}
              </div>
              <div>
                <label>Country:</label>
                <Select
                  options={options}
                  onChange={handleCountryChange}
                  placeholder="Select Country"
                  value={
                    options.find((opt) => opt.label === form.Country) || null
                  }
                />
              </div>
              <div className={styles.buutons}>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isLoading}
                  className={styles.buutonsv1}
                >
                  {isLoading ? "Processing..." : editingId ? "Update" : "Save"}
                </button>
                <button
                  className={styles.buutonsv2}
                  type="button"
                  onClick={() => {
                    setIsFormOpen(false);
                    setEmailStatus("");
                    setEditingId(null);
                  }}
                  disabled={isLoading}
                  style={{
                    cursor: isLoading ? "not-allowed" : "pointer",

                    opacity: isLoading ? 0.7 : 1,
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div>
        <table>
          <thead>
            <tr>
              <th> ID</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>DOB</th>
              <th>Course</th>
              <th>Grade</th>
              <th>Sex</th>
              <th>P/Number</th>
              <th>Guardian</th>
              <th>G.P/Nunber</th>
              <th>S/Date</th>
              <th>Country</th>
              <th>S/Origin</th>
              <th>Address</th>
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
                  <td>{student.studentId}</td>
                  <td>
                    {student.StudentIMG ? (
                      <img
                        src={student.StudentIMG}
                        alt={student.FullName}
                        style={{
                          width: "50px",
                          height: "5rem",
                          borderRadius: "5rem",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div>No Photo</div>
                    )}
                    {student.FullName}
                  </td>
                  <td>{student.Email}</td>
                  <td>{student.DOfB}</td>
                  <td>{student.Course}</td>
                  <td>{student.GradeLevel}</td>
                  <td>{student.Gender}</td>
                  <td>{student.PhoneNumber}</td>
                  <td>{student.Guardian}</td>

                  <td>{student.GuardianPhoneNumber}</td>
                  <td>
                    {student.DateJoined
                      ? new Date(student.DateJoined).toLocaleDateString()
                      : ""}
                  </td>
                  <td>{student.Country}</td>

                  <td>{student.StateOfOrigin}</td>
                  <td>{student.Address}</td>

                  <td>
                    <button onClick={() => handleEdit(student)}>
                      <FaEdit />
                    </button>
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
