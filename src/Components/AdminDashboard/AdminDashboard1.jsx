import { useState, useEffect } from "react";
import { RiDeleteBin5Line } from "react-icons/ri";
import { FaEdit, FaSearch, FaMoneyCheckAlt, FaUserGraduate, FaChalkboardTeacher, FaCog, FaPlus, FaExpand, FaCompress } from "react-icons/fa";
import { IoMdNotifications } from "react-icons/io";
import { MdPayment, MdDashboard, MdAnalytics, MdGroup } from "react-icons/md";
import Select from "react-select";
import countryList from "react-select-country-list";
import styles from './AdminDashboard1.module.css';

export default function AdminDashboard() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailStatus, setEmailStatus] = useState("");
  const [recentActivities, setRecentActivities] = useState([]);
  const [activeTab, setActiveTab] = useState("students");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(3);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Form state for adding/editing students and teachers
  const [form, setForm] = useState({
    Email: "",
    FullName: "",
    DOfB: "",
    Course: "",
    DateJoined: "",
    Image: null,
    Country: "",
    GradeLevel: "",
    PhoneNumber: "",
    Gender: "",
    preview: "",
  });

  const countryOptions = countryList().getData();

  // Fetch students and teachers from backend on component load
  useEffect(() => {
    fetchStudents();
    fetchTeachers();
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

  const fetchTeachers = async () => {
    try {
      const response = await fetch("http://localhost:5000/admin/teachers");
      const data = await response.json();
      if (response.ok) {
        setTeachers(data);
      } else {
        console.error("Failed to fetch teachers:", data.message);
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCountryChange = (selected) => {
    setForm((prev) => ({
      ...prev,
      Country: selected.label,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewURL = URL.createObjectURL(file);
      setForm((prev) => ({
        ...prev,
        Image: file,
        preview: previewURL,
      }));
    }
  };

  // Reset form when switching between student and teacher forms
  const resetForm = () => {
    setForm({
      Email: "",
      FullName: "",
      DOfB: "",
      Course: "",
      DateJoined: "",
      Image: null,
      Country: "",
      GradeLevel: "",
      PhoneNumber: "",
      Gender: "",
      preview: "",
    });
    setEditingId(null);
  };

  // Save student (add or edit)
  const handleSaveStudent = async (e) => {
    e.preventDefault();

    if (
      !form.FullName ||
      !form.Email ||
      !form.DOfB ||
      !form.Course ||
      !form.GradeLevel ||
      !form.DateJoined ||
      !form.Country ||
      !form.PhoneNumber ||
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
      formData.append("DateJoined", form.DateJoined);
      formData.append("Country", form.Country);
      formData.append("PhoneNumber", form.PhoneNumber);
      formData.append("Gender", form.Gender);
      
      if (form.Image) {
        formData.append("StudentIMG", form.Image);
      }
      
      let response;
      let url;
      
      if (editingId) {
        // UPDATE student
        url = `http://localhost:5000/admin/students/${editingId}`;
        response = await fetch(url, {
          method: "PUT",
          body: formData,
        });
      } else {
        // ADD student
        url = "http://localhost:5000/admin/add-student";
        response = await fetch(url, {
          method: "POST",
          body: formData,
        });
      }

      const data = await response.json();

      if (response.ok) {
        setEmailStatus(
          editingId
            ? "✅ Student updated successfully!"
            : `✅ Student registered successfully!`
        );

        // Add to recent activities
        if (!editingId) {
          setRecentActivities(prev => [{
            type: "student_added",
            message: `New student registered: ${form.FullName}`,
            timestamp: new Date().toISOString()
          }, ...prev]);
        }

        // Refresh students list
        await fetchStudents();

        // Reset form
        resetForm();

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

  // Save teacher (add or edit)
  const handleSaveTeacher = async (e) => {
    e.preventDefault();

    if (
      !form.Email ||
      !form.FullName ||
      !form.DOfB ||
      !form.Course ||
      !form.DateJoined ||
      !form.Country
    ) {
      setEmailStatus("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    setEmailStatus(
      editingId ? "Updating teacher..." : "Processing teacher registration..."
    );

    try {
      const formData = new FormData();
      formData.append("Email", form.Email);
      formData.append("FullName", form.FullName);
      formData.append("DOfB", form.DOfB);
      formData.append("Course", form.Course);
      formData.append("DateJoined", form.DateJoined);
      formData.append("Country", form.Country);
      
      if (form.Image) {
        formData.append("TeacherIMG", form.Image);
      }
      
      let response;
      let url;
      
      if (editingId) {
        // UPDATE teacher
        url = `http://localhost:5000/admin/update-teacher/${editingId}`;
        response = await fetch(url, {
          method: "PUT",
          body: formData,
        });
      } else {
        // ADD teacher
        url = "http://localhost:5000/admin/add-teacher";
        response = await fetch(url, {
          method: "POST",
          body: formData,
        });
      }

      const data = await response.json();

      if (response.ok) {
        setEmailStatus(
          editingId
            ? "✅ Teacher updated successfully!"
            : `✅ Teacher registered successfully! Password sent to email.`
        );

        // Add to recent activities
        if (!editingId) {
          setRecentActivities(prev => [{
            type: "teacher_added",
            message: `New teacher registered: ${form.FullName}`,
            timestamp: new Date().toISOString()
          }, ...prev]);
        }

        // Refresh teachers list
        await fetchTeachers();

        // Reset form
        resetForm();

        // Close form after 3 seconds
        setTimeout(() => {
          setIsFormOpen(false);
          setEmailStatus("");
        }, 3000);
      } else {
        throw new Error(data.message || "Failed to save teacher");
      }
    } catch (error) {
      console.error("Save error:", error);
      setEmailStatus(`❌ Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Edit student
  const handleEditStudent = (student) => {
    setForm({
      Email: student.Email,
      FullName: student.FullName,
      DOfB: student.DOfB,
      Course: student.Course,
      GradeLevel: student.GradeLevel,
      DateJoined: student.DateJoined,
      Country: student.Country,
      Image: student.StudentIMG,
      preview: student.StudentIMG,
      PhoneNumber: student.PhoneNumber,
      Gender: student.Gender,
    });
    setEditingId(student.studentId);
    setActiveTab("students");
    setIsFormOpen(true);
  };

  // Edit teacher
  const handleEditTeacher = (teacher) => {
    setForm({
      Email: teacher.Email,
      FullName: teacher.FullName,
      DOfB: teacher.DOfB,
      Course: teacher.Course,
      DateJoined: teacher.DateJoined,
      Country: teacher.Country,
      Image: teacher.TeacherIMG,
      preview: teacher.TeacherIMG,
    });
    setEditingId(teacher.teacherId);
    setActiveTab("teachers");
    setIsFormOpen(true);
  };

  // Delete student
  const handleDeleteStudent = async (studentId) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        const response = await fetch(
          `http://localhost:5000/admin/students/${studentId}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          setStudents(students.filter(student => student.studentId !== studentId));
          setEmailStatus("✅ Student deleted successfully");
          
          // Add to recent activities
          setRecentActivities(prev => [{
            type: "student_deleted",
            message: "Student record deleted",
            timestamp: new Date().toISOString()
          }, ...prev]);
          
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

  // Delete teacher
  const handleDeleteTeacher = async (teacher) => {
    if (!window.confirm(`Are you sure you want to delete ${teacher.FullName}?`)) return;

    try {
      const res = await fetch(
        `http://localhost:5000/admin/teachers/${teacher.teacherId}`,
        { method: "DELETE" }
      );

      if (res.ok) {
        setTeachers(teachers.filter(t => t.teacherId !== teacher.teacherId));
        setEmailStatus("✅ Teacher deleted successfully");
        
        // Add to recent activities
        setRecentActivities(prev => [{
          type: "teacher_deleted",
          message: `Teacher deleted: ${teacher.FullName}`,
          timestamp: new Date().toISOString()
        }, ...prev]);
        
        setTimeout(() => setEmailStatus(""), 3000);
      } else {
        throw new Error("Failed to delete teacher");
      }
    } catch (err) {
      console.error(err);
      setEmailStatus("❌ Error deleting teacher");
      setTimeout(() => setEmailStatus(""), 3000);
    }
  };

  // Handle payment status change
  const handlePayment = async (studentId) => {
    if (window.confirm("Mark this student as paid?")) {
      try {
        const response = await fetch(
          `http://localhost:5000/admin/students/${studentId}/payment`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ paymentStatus: "Paid" }),
          }
        );

        if (response.ok) {
          setStudents(students.map(student => 
            student.studentId === studentId 
              ? { ...student, paymentStatus: "Paid" } 
              : student
          ));
          
          // Add to recent activities
          const paidStudent = students.find(s => s.studentId === studentId);
          if (paidStudent) {
            setRecentActivities(prev => [{
              type: "payment_received",
              message: `Payment received from ${paidStudent.FullName}`,
              timestamp: new Date().toISOString()
            }, ...prev]);
          }
          
          alert("Payment status updated!");
        } else {
          throw new Error("Failed to update payment status");
        }
      } catch (error) {
        console.error("Payment error:", error);
        alert("Error updating payment status");
      }
    }
  };

  // Filter students based on search term
  const filteredStudents = students.filter(student => 
    student.FullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.Course?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.Email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter teachers based on search term
  const filteredTeachers = teachers.filter(teacher => 
    teacher.FullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.Course?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.Email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
  const currentTeachers = filteredTeachers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPagesStudents = Math.ceil(filteredStudents.length / itemsPerPage);
  const totalPagesTeachers = Math.ceil(filteredTeachers.length / itemsPerPage);
  const totalPages = activeTab === "students" ? totalPagesStudents : totalPagesTeachers;

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    if (!isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  };

  // Calculate payment statistics
  const paidStudents = students.filter(student => student.paymentStatus === "Paid").length;
  const pendingPayments = students.filter(student => student.paymentStatus === "Pending").length;
  const totalStudents = students.length;
  const totalTeachers = teachers.length;

  // Format activity timestamp
  const formatActivityTime = (timestamp) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInHours = Math.floor((now - activityTime) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  return (
    <div className={styles.adminDashboard}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>Admin Dashboard</h1>
          <p>Welcome back, Administrator</p>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.searchBox}>
            <FaSearch className={styles.faSearch} />
            <input 
              type="text" 
              placeholder={`Search ${activeTab}...`} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className={styles.userProfile}>
            
            <div className={styles.userInfo}>
              <p>Admin User</p>
              <span>Administrator</span>
            </div>
          </div>
        </div>
      </header>

      <div className={styles.dashboardContent}>
        {/* Welcome Section */}
        <div className={styles.welcomeSection}>
          <h2>Dashboard Overview</h2>
          <p>Manage your institution's operations and monitor key metrics</p>
        </div>

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

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{backgroundColor: 'var(--sky)'}}>
              <MdGroup />
            </div>
            <div className={styles.statInfo}>
              <h3>{totalTeachers}</h3>
              <p>Total Teachers</p>
            </div>
          </div>
        </div>

        {/* Recent Activity - Only show when there are activities */}
        {recentActivities.length > 0 && (
          <div className={styles.activityContainer}>
            <div className={styles.activityHeader}>
              <h3>Recent Activity</h3>
              <button onClick={() => setRecentActivities([])}>Clear All</button>
            </div>
            <div className={styles.activityList}>
              {recentActivities.slice(0, 4).map((activity, index) => (
                <div key={index} className={styles.activityItem}>
                  <div className={styles.activityIcon}>
                    {activity.type === "student_added" && <FaUserGraduate />}
                    {activity.type === "student_deleted" && <RiDeleteBin5Line />}
                    {activity.type === "payment_received" && <MdPayment />}
                    {activity.type === "teacher_added" && <FaChalkboardTeacher />}
                    {activity.type === "teacher_deleted" && <RiDeleteBin5Line />}
                  </div>
                  <div className={styles.activityContent}>
                    <p>{activity.message}</p>
                    <span>{formatActivityTime(activity.timestamp)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}                                   

        {/* Quick Actions & Management Table */}
        <div className={`${styles.mainContentRow} ${isFullscreen ? styles.fullscreenMode : ''}`}>
          {/* Management Table Section */}
          <div className={styles.tableSection}>
            <div className={styles.tabContainer}>
              <button 
                className={activeTab === "students" ? styles.activeTab : styles.tab}
                onClick={() => {
                  setActiveTab("students");
                  setCurrentPage(1);
                }}
              >
                Student Management
              </button>
              <button 
                className={activeTab === "teachers" ? styles.activeTab : styles.tab}
                onClick={() => {
                  setActiveTab("teachers");
                  setCurrentPage(1);
                }}
              >
                Teacher Management
              </button>
            </div>

            <div className={styles.tableHeader}>
              <h3>{activeTab === "students" ? "Student Management" : "Teacher Management"}</h3>
              <div className={styles.tableActions}>
                <button 
                  className={styles.addBtn}
                  onClick={() => {
                    resetForm();
                    setIsFormOpen(true);
                  }}
                >
                  <FaPlus /> Add {activeTab === "students" ? "Student" : "Teacher"}
                </button>
                <button 
                  className={styles.fullscreenBtn}
                  onClick={toggleFullscreen}
                  title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                >
                  {isFullscreen ? <FaCompress /> : <FaExpand />}
                </button>
              </div>
            </div>

            {emailStatus && (
              <div className={emailStatus.includes("✅") ? styles.successMessage : styles.errorMessage}>
                {emailStatus}
              </div>
            )}

            <div className={styles.tableContainer}>
              {/* Students Table */}
              {activeTab === "students" && (
                <table className={styles.dataTable}>
                  <thead>
                    <tr> 
                      <th>ID</th>
                      <th>Student</th>
                      <th>Email</th>
                      <th>Course</th>
                      <th>Grade</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentStudents.length === 0 ? (
                      <tr>
                        <td colSpan="7" className={styles.noData}>
                          No students found. Click "Add Student" to get started.
                        </td>
                      </tr>
                    ) : (
                      currentStudents.map((student) => (
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
                            <div className={styles.studentInfo}>
                              <span className={styles.studentName}>{student.FullName}</span>
                              <span className={styles.studentDetail}>{student.Gender}</span>
                            </div>
                          </td>
                          <td>{student.Email}</td>
                          <td>{student.Course}</td>
                          <td>{student.GradeLevel}</td>
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
                                onClick={() => handleEditStudent(student)}
                                title="Edit Student"
                              >
                                <FaEdit />
                              </button>
                              <button 
                                className={styles.paymentBtn}
                                onClick={() => handlePayment(student.studentId)}
                                disabled={student.paymentStatus === "Paid"}
                                title={student.paymentStatus === "Paid" ? "Already Paid" : "Mark as Paid"}
                              >
                                <FaMoneyCheckAlt />
                              </button>
                              <button 
                                className={styles.deleteBtn}
                                onClick={() => handleDeleteStudent(student.studentId)}
                                title="Delete Student"
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
              )}

              {/* Teachers Table */}
              {activeTab === "teachers" && (
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Teacher</th>
                      <th>Email</th>
                      <th>Course</th>
                      <th>Date Joined</th>
                      <th>Country</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentTeachers.length === 0 ? (
                      <tr>
                        <td colSpan="7" className={styles.noData}>
                          No teachers found. Click "Add Teacher" to get started.
                        </td>
                      </tr>
                    ) : (
                      currentTeachers.map((teacher) => (
                        <tr key={teacher.teacherId}>
                          <td>{teacher.teacherId}</td>
                          <td className={styles.studentCell}>
                            {teacher.TeacherIMG ? (
                              <img
                                src={teacher.TeacherIMG}
                                alt={teacher.FullName}
                                className={styles.studentAvatar}
                              />
                            ) : (
                              <div className={styles.studentAvatar}>No Photo</div>
                            )}
                            <div className={styles.studentInfo}>
                              <span className={styles.studentName}>{teacher.FullName}</span>
                            </div>
                          </td>
                          <td>{teacher.Email}</td>
                          <td>{teacher.Course}</td>
                          <td>{teacher.DateJoined}</td>
                          <td>{teacher.Country}</td>
                          <td>
                            <div className={styles.actionButtons}>
                              <button 
                                className={styles.editBtn}
                                onClick={() => handleEditTeacher(teacher)}
                                title="Edit Teacher"
                              >
                                <FaEdit />
                              </button>
                              <button 
                                className={styles.deleteBtn}
                                onClick={() => handleDeleteTeacher(teacher)}
                                title="Delete Teacher"
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
              )}
            </div>

            {/* Pagination Controls */}
            {(totalPages > 1) && (
              <div className={styles.pagination}>
                <button 
                  onClick={() => paginate(currentPage - 1)} 
                  disabled={currentPage === 1}
                  className={styles.paginationBtn}
                >
                  Previous
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                  <button
                    key={number}
                    onClick={() => paginate(number)}
                    className={currentPage === number ? styles.activePage : styles.paginationBtn}
                  >
                    {number}
                  </button>
                ))}
                
                <button 
                  onClick={() => paginate(currentPage + 1)} 
                  disabled={currentPage === totalPages}
                  className={styles.paginationBtn}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Student/Teacher Form Modal */}
      {isFormOpen && (
        <div className={styles.formModal}>
          <div className={styles.formContainer}>
            <div className={styles.formHeader}>
              <h3>{editingId ? `Edit ${activeTab === "students" ? "Student" : "Teacher"}` : `Add New ${activeTab === "students" ? "Student" : "Teacher"}`}</h3>
              <button 
                className={styles.closeButton}
                onClick={() => {
                  setIsFormOpen(false);
                  setEmailStatus("");
                  resetForm();
                }}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={activeTab === "students" ? handleSaveStudent : handleSaveTeacher} className={styles.studentForm}>
              {/* Personal Information Section */}
              <div className={styles.formSection}>
                <h4>Personal Information</h4>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Full Name *</label>
                    <input
                      type="text"
                      name="FullName"
                      placeholder="Full Name"
                      value={form.FullName}
                      onChange={handleInputChange}
                      required
                      className={styles.largeInput}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Email *</label>
                    <input
                      type="email"
                      name="Email"
                      placeholder="Email"
                      value={form.Email}
                      onChange={handleInputChange}
                      required
                      className={styles.largeInput}
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
                      className={styles.largeInput}
                    />
                  </div>
                  {activeTab === "students" && (
                    <div className={styles.formGroup}>
                      <label>Phone Number *</label>
                      <input
                        type="tel"
                        name="PhoneNumber"
                        placeholder="Phone number"
                        value={form.PhoneNumber}
                        onChange={handleInputChange}
                        required
                        className={styles.largeInput}
                      />
                    </div>
                  )}
                </div>
                
                {activeTab === "students" && (
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Gender *</label>
                      <select
                        name="Gender"
                        value={form.Gender}
                        onChange={handleInputChange}
                        required
                        className={styles.largeInput}
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                  </div>
                )}
                
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>{activeTab === "students" ? "Student" : "Teacher"} Photo</label>
                    <input
                      type="file"
                      accept="image/*"
                      name="Image"
                      onChange={handleImageChange}
                      className={styles.largeInput}
                    />
                    {form.preview && (
                      <img
                        className={styles.previewImage}
                        src={form.preview}
                        alt="Preview"
                      />
                    )}
                  </div>
                  <div className={styles.formGroup}>
                    <label>Country *</label>
                    <Select
                      options={countryOptions}
                      onChange={handleCountryChange}
                      placeholder="Select Country"
                      value={countryOptions.find((opt) => opt.label === form.Country) || null}
                      className={styles.largeInput}
                    />
                  </div>
                </div>
              </div>

              {/* Academic Information Section */}
              <div className={styles.formSection}>
                <h4>{activeTab === "students" ? "Academic" : "Professional"} Information</h4>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Course *</label>
                    <select
                      name="Course"
                      value={form.Course}
                      onChange={handleInputChange}
                      required
                      className={styles.largeInput}
                    >
                      <option value="">Select Course</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Biology">Biology</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="English">English</option>
                      <option value="History">History</option>
                    </select>
                  </div>
                  {activeTab === "students" && (
                    <div className={styles.formGroup}>
                      <label>Grade Level *</label>
                      <select
                        name="GradeLevel"
                        value={form.GradeLevel}
                        onChange={handleInputChange}
                        required
                        className={styles.largeInput}
                      >
                        <option value="">Select Grade Level</option>
                        <option value="9th Grade">9th Grade</option>
                        <option value="10th Grade">10th Grade</option>
                        <option value="11th Grade">11th Grade</option>
                        <option value="12th Grade">12th Grade</option>
                      </select>
                    </div>
                  )}
                </div>
                
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Date {activeTab === "students" ? "Enrolled" : "Joined"} *</label>
                    <input
                      type="date"
                      name="DateJoined"
                      value={form.DateJoined}
                      onChange={handleInputChange}
                      required
                      className={styles.largeInput}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.formActions}>
                <button type="submit" className={styles.btnPrimary} disabled={isLoading}>
                  {isLoading ? "Processing..." : editingId ? `Update ${activeTab === "students" ? "Student" : "Teacher"}` : `Add ${activeTab === "students" ? "Student" : "Teacher"}`}
                </button>
                <button 
                  type="button" 
                  className={styles.btnSecondary}
                  onClick={() => {
                    setIsFormOpen(false);
                    setEmailStatus("");
                    resetForm();
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
    </div>
  );
}