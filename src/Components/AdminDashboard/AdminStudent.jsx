import { RiDeleteBin6Line } from "react-icons/ri"; 
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
  const [editingId, setEditingId] = useState(null);
  
  // Added from first code: Search and Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 10;

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
        // UPDATE student
        response = await fetch(
          `http://localhost:5000/admin/students/${editingId}`,
          {
            method: "PUT",
            body: formData,
          }
        );
      } else {
        // ADD student
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

  // Edit button handler
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
    setEditingId(student.studentId);
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

  // Enhanced Search and Pagination logic - searches by ID, Name, Email, and Course
  const filteredStudents = students.filter((student) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (student.studentId || "").toLowerCase().includes(searchLower) ||
      (student.FullName || "").toLowerCase().includes(searchLower) ||
      (student.Email || "").toLowerCase().includes(searchLower) ||
      (student.Course || "").toLowerCase().includes(searchLower)
    );
  });

  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
  const startIndex = (currentPage - 1) * studentsPerPage;
  const paginatedStudents = filteredStudents.slice(
    startIndex,
    startIndex + studentsPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className={styles.container}>
      {/* Enhanced Header with Search - from first code */}
      <div className={styles.header}>
        <h1>Students</h1>
        <div className={styles.actions}>
          <input
            type="text"
            placeholder="Search by ID, Name, Email, or Course..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // reset to page 1 when searching
            }}
            className={styles.search}
          />
          <button
            onClick={() => {
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
              setIsFormOpen(true);
            }}
            className={styles.addBtn}
          >
            + Add Student
          </button>
        </div>
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

      {/* Enhanced Modal Form - keeping your backend integration */}
      {isFormOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>{editingId ? "Edit Student" : "Add Student"}</h2>
            <form className={styles.form} onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
              <input
                type="text"
                name="FullName"
                placeholder="Full Name"
                value={form.FullName}
                onChange={handleInputChange}
                required
              />
              <input
                type="email"
                name="Email"
                placeholder="Email"
                value={form.Email}
                onChange={handleInputChange}
                required
              />
              <input
                type="date"
                name="DOfB"
                value={form.DOfB}
                onChange={handleInputChange}
                required
              />
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
              <input
                type="text"
                name="Guardian"
                placeholder="Guardian Name"
                value={form.Guardian}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="PhoneNumber"
                placeholder="Phone Number"
                value={form.PhoneNumber}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="GuardianPhoneNumber"
                placeholder="Guardian Phone Number"
                value={form.GuardianPhoneNumber}
                onChange={handleInputChange}
                required
              />
              <label>
                Date Enrolled:
                <input
                  type="datetime-local"
                  name="DateJoined"
                  value={form.DateJoined}
                  onChange={handleInputChange}
                  required
                />
              </label>
              <Select
                options={options}
                onChange={handleCountryChange}
                placeholder="Select Country"
                value={options.find((opt) => opt.label === form.Country) || null}
              />
              <input
                type="text"
                name="StateOfOrigin"
                placeholder="State of Origin"
                value={form.StateOfOrigin}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="Address"
                placeholder="Address"
                value={form.Address}
                onChange={handleInputChange}
                required
              />
              <select
                name="Gender"
                value={form.Gender}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <input
                type="file"
                name="StudentIMG"
                accept="image/*"
                onChange={handleImageChange}
                required={!editingId}
              />
              {form.preview && (
                <img
                  src={form.preview}
                  alt="preview"
                  className={styles.preview}
                />
              )}

              <div className={styles.modalActions}>
                <button type="submit" className={styles.saveBtn} disabled={isLoading}>
                  {isLoading ? "Processing..." : editingId ? "Update" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingId(null);
                    setEmailStatus("");
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
                  }}
                  className={styles.cancelBtn}
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enhanced Table with proper styling - from first code structure */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Photo</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>DOB</th>
              <th>Course</th>
              <th>Grade</th>
              <th>Sex</th>
              <th>P/Number</th>
              <th>Guardian</th>
              <th>G.P/Number</th>
              <th>S/Date</th>
              <th>Country</th>
              <th>S/Origin</th>
              <th>Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedStudents.length === 0 ? (
              <tr>
                <td colSpan="16">
                  No students found. Click "Add Student" to get started.
                </td>
              </tr>
            ) : (
              paginatedStudents.map((student, index) => (
                <tr key={student._id || index}>
                  <td>{student.studentId}</td>
                  <td>
                    {student.StudentIMG ? (
                      <img
                        src={student.StudentIMG}
                        alt={student.FullName}
                        className={styles.photo}
                      />
                    ) : (
                      <div>No Photo</div>
                    )}
                  </td>
                  <td>{student.FullName}</td>
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
                  <td className={styles.actionsCol}>
                    <button
                      className={styles.editBtn}
                      onClick={() => handleEdit(student)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(student.studentId, index)}
                    >
                      <RiDeleteBin6Line />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Added Pagination Controls from first code */}
        <div className={styles.pagination}>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages || 1}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}