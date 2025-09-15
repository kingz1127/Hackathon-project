import { useState, useEffect } from "react";
import { RiDeleteBin5Line } from "react-icons/ri";
import { FaEdit, FaSearch, FaMoneyCheckAlt, FaUserGraduate } from "react-icons/fa";
import { IoMdNotifications } from "react-icons/io";
import { MdPayment } from "react-icons/md";
import styles from './AdminDashboard1.module.css';

export default function AdminDashboard1() {
  const [activeTab, setActiveTab] = useState("students");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailStatus, setEmailStatus] = useState("");

  // Form state for adding/editing students
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

  // Handle form input changes
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

  // Save student (add or edit)
  const handleSave = async (e) => {
    e.preventDefault();

    if (
      !form.FullName ||
      !form.Email ||
      !form.DOfB ||
      !form.Course ||
      !form.GradeLevel ||
      !form.Guardian ||
      !form.DateJoined ||
      !form.Country ||
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
      if (form.StudentIMG) {
        formData.append("StudentIMG", form.StudentIMG);
      }
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

  // Edit student
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

  // Delete student
  const handleDelete = async (studentId) => {
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
          setStudents(students.filter(student => student.studentId !== studentId));
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

  // Handle payment status change
  const handlePayment = (studentId) => {
    if (window.confirm("Mark this student as paid?")) {
      setStudents(students.map(student => 
        student.studentId === studentId 
          ? { ...student, paymentStatus: "Paid" } 
          : student
      ));
      alert("Payment status updated!");
    }
  };

  // Filter students based on search term
  const filteredStudents = students.filter(student => 
    student.FullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.Course?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.Email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate payment statistics
  const paidStudents = students.filter(student => student.paymentStatus === "Paid").length;
  const pendingPayments = students.filter(student => student.paymentStatus === "Pending").length;
  const totalStudents = students.length;

  // Calculate angles for pie chart
  const paidPercentage = totalStudents > 0 ? (paidStudents / totalStudents) * 100 : 0;
  const pendingPercentage = totalStudents > 0 ? (pendingPayments / totalStudents) * 100 : 0;

  return (
    <div className={styles.adminDashboard}>
      <header className={styles.header}>
        <h1>EduAdmin Dashboard</h1>
        <div className={styles.headerActions}>
          <div className={styles.searchBox}>
            <FaSearch />
            <input 
              type="text" 
              placeholder="Search students..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className={styles.notificationContainer}>
            <button 
              className={styles.notificationBtn}
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <IoMdNotifications />
            </button>
            {showNotifications && (
              <div className={styles.notificationDropdown}>
                <p>No new notifications</p>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className={styles.dashboardGrid}>
        {/* Statistics Cards */}
        <div className={styles.statsContainer}>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{backgroundColor: 'var(--teal)'}}>
              <FaUserGraduate />
            </div>
            <div className={styles.statInfo}>
              <h3>{totalStudents}</h3>
              <p>Total Students</p>
            </div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{backgroundColor: 'var(--emerald)'}}>
              <MdPayment />
            </div>
            <div className={styles.statInfo}>
              <h3>{paidStudents}</h3>
              <p>Paid Students</p>
            </div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{backgroundColor: 'var(--ruby)'}}>
              <FaMoneyCheckAlt />
            </div>
            <div className={styles.statInfo}>
              <h3>{pendingPayments}</h3>
              <p>Pending Payments</p>
            </div>
          </div>
        </div>

        {/* Payment Overview Chart */}
        <div className={styles.chartContainer}>
          <h2>Payment Overview</h2>
          <div className={styles.pieChart}>
            <div className={styles.pieChartVisual}>
              <div 
                className={styles.pieSegmentPaid} 
                style={{
                  transform: `rotate(0deg)`,
                  clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.sin(2 * Math.PI * paidPercentage / 100)}% ${50 - 50 * Math.cos(2 * Math.PI * paidPercentage / 100)}%, 50% 50%)`
                }}
              ></div>
              <div 
                className={styles.pieSegmentPending} 
                style={{
                  transform: `rotate(${paidPercentage * 3.6}deg)`,
                  clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.sin(2 * Math.PI * pendingPercentage / 100)}% ${50 - 50 * Math.cos(2 * Math.PI * pendingPercentage / 100)}%, 50% 50%)`
                }}
              ></div>
              <div className={styles.pieChartCenter}>
                <span>{totalStudents}</span>
                <small>Total</small>
              </div>
            </div>
            <div className={styles.chartLegend}>
              <div className={styles.legendItem}>
                <div className={styles.legendColor} style={{backgroundColor: 'var(--emerald)'}}></div>
                <span>Paid: {paidStudents} ({Math.round(paidPercentage)}%)</span>
              </div>
              <div className={styles.legendItem}>
                <div className={styles.legendColor} style={{backgroundColor: 'var(--ruby)'}}></div>
                <span>Pending: {pendingPayments} ({Math.round(pendingPercentage)}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Student Management Section */}
        <div className={styles.tabContainer}>
          <div className={styles.contentHeader}>
            <h2>Student Management</h2>
            <button 
              className={styles.addBtn}
              onClick={() => {
                setEditingId(null);
                setIsFormOpen(true);
              }}
            >
              + Add Student
            </button>
          </div>

          {emailStatus && (
            <div className={emailStatus.includes("✅") ? styles.successMessage : styles.errorMessage}>
              {emailStatus}
            </div>
          )}

          {/* Add/Edit Student Form Modal */}
          {isFormOpen && (
            <div className={styles.formModal}>
              <div className={styles.formContainer}>
                <h3>{editingId ? "Edit Student" : "Add New Student"}</h3>
                <form onSubmit={handleSave}>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Email *</label>
                      <input
                        type="email"
                        name="Email"
                        placeholder="Email"
                        value={form.Email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Full Name *</label>
                      <input
                        type="text"
                        name="FullName"
                        placeholder="Full Name"
                        value={form.FullName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Date of Birth *</label>
                      <input
                        type="date"
                        name="DOfB"
                        value={form.DOfB}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Phone Number *</label>
                      <input
                        type="tel"
                        name="PhoneNumber"
                        placeholder="Phone number"
                        value={form.PhoneNumber}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Course *</label>
                      <input
                        type="text"
                        name="Course"
                        placeholder="Course"
                        value={form.Course}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Grade Level *</label>
                      <input
                        type="text"
                        name="GradeLevel"
                        placeholder="Grade Level"
                        value={form.GradeLevel}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Gender *</label>
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
                    <div className={styles.formGroup}>
                      <label>Guardian Name *</label>
                      <input
                        type="text"
                        name="Guardian"
                        placeholder="Guardian/Parent Name"
                        value={form.Guardian}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Guardian Phone *</label>
                      <input
                        type="tel"
                        name="GuardianPhoneNumber"
                        placeholder="Guardian Phone Number"
                        value={form.GuardianPhoneNumber}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Date Enrolled *</label>
                      <input
                        type="datetime-local"
                        name="DateJoined"
                        value={form.DateJoined}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Address *</label>
                      <input
                        type="text"
                        name="Address"
                        placeholder="Address"
                        value={form.Address}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>State of Origin *</label>
                      <input
                        type="text"
                        name="StateOfOrigin"
                        placeholder="State Of Origin"
                        value={form.StateOfOrigin}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Country *</label>
                      <input
                        type="text"
                        name="Country"
                        placeholder="Country"
                        value={form.Country}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Student Photo</label>
                      <input
                        type="file"
                        accept="image/*"
                        name="StudentIMG"
                        onChange={handleImageChange}
                        required={!editingId}
                      />
                      {form.preview && (
                        <img
                          className={styles.previewImage}
                          src={form.preview}
                          alt="Preview"
                        />
                      )}
                    </div>
                  </div>

                  <div className={styles.formActions}>
                    <button type="submit" className={styles.btnPrimary} disabled={isLoading}>
                      {isLoading ? "Processing..." : editingId ? "Update" : "Save"}
                    </button>
                    <button 
                      type="button" 
                      className={styles.btnSecondary}
                      onClick={() => {
                        setIsFormOpen(false);
                        setEmailStatus("");
                        setEditingId(null);
                      }}
                      disabled={isLoading}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Students Table */}
          <div className={styles.tableContainer}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Student</th>
                  <th>Email</th>
                  <th>Course</th>
                  <th>Grade</th>
                  <th>Gender</th>
                  <th>Guardian</th>
                  <th>Payment Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="9" className={styles.noData}>
                      No students found. Click "Add Student" to get started.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr key={student.studentId}>
                      <td>{student.studentId}</td>
                      <td className={styles.studentCell}>
                        {student.StudentIMG ? (
                          <img
                            src={student.StudentIMG}
                            alt={student.FullName}
                            className={styles.studentAvatar}
                          />
                        ) : (
                          <div className={styles.studentAvatar}>No Photo</div>
                        )}
                        <span>{student.FullName}</span>
                      </td>
                      <td>{student.Email}</td>
                      <td>{student.Course}</td>
                      <td>{student.GradeLevel}</td>
                      <td>{student.Gender}</td>
                      <td>{student.Guardian}</td>
                      <td>
                        <span className={
                          student.paymentStatus === "Paid" 
                            ? styles.statusPaid 
                            : styles.statusPending
                        }>
                          {student.paymentStatus || "Pending"}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actionButtons}>
                          <button 
                            className={styles.editBtn}
                            onClick={() => handleEdit(student)}
                          >
                            <FaEdit />
                          </button>
                          <button 
                            className={styles.paymentBtn}
                            onClick={() => handlePayment(student.studentId)}
                            disabled={student.paymentStatus === "Paid"}
                          >
                            <FaMoneyCheckAlt />
                            {student.paymentStatus === "Paid" ? "Paid" : "Mark Paid"}
                          </button>
                          <button 
                            className={styles.deleteBtn}
                            onClick={() => handleDelete(student.studentId)}
                          >
                            <RiDeleteBin5Line />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}