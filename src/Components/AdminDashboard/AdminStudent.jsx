import { useState } from "react";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import styles from "./AdminStudent.module.css";
import countries from "./countries";

export default function AdminStudent() {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchId, setSearchId] = useState("");
  const [students, setStudents] = useState([
    {
      id: "STU001",
      photo: "https://via.placeholder.com/40",
      fullName: "John Doe",
      email: "john@example.com",
      dob: "2000-01-01",
      course: "Computer Science",
      grade: "A",
      sex: "Male",
      phone: "+2348012345678",
      guardian: "Mr. Doe",
      gphone: "+2348098765432",
      sdate: "2022-09-01",
      country: "Nigeria",
      origin: "Lagos",
      address: "12 Allen Avenue",
    },
  ]);

  const [formData, setFormData] = useState(initialForm());
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 10;

  function initialForm() {
    return {
      fullName: "",
      email: "",
      dob: "",
      course: "",
      grade: "",
      guardian: "",
      phone: "",
      gphone: "",
      gdob: "",
      country: "",
      origin: "",
      address: "",
      sex: "",
      photo: null,
      preview: null,
    };
  }

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "photo") {
      const file = files[0];
      setFormData({
        ...formData,
        photo: file,
        preview: file ? URL.createObjectURL(file) : null,
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email || !formData.dob) {
      alert("Full Name, Email and DOB are required!");
      return;
    }

    if (editingId) {
      setStudents(
        students.map((stu) =>
          stu.id === editingId
            ? {
                ...stu,
                fullName: formData.fullName,
                email: formData.email,
                dob: formData.dob,
                course: formData.course,
                grade: formData.grade,
                sex: formData.sex,
                phone: formData.phone,
                guardian: formData.guardian,
                gphone: formData.gphone,
                country: formData.country,
                origin: formData.origin,
                address: formData.address,
                photo: formData.preview || stu.photo,
              }
            : stu
        )
      );
    } else {
      const newStudent = {
        id: `STU${String(students.length + 1).padStart(3, "0")}`,
        photo: formData.preview || "https://via.placeholder.com/40",
        fullName: formData.fullName,
        email: formData.email,
        dob: formData.dob,
        course: formData.course,
        grade: formData.grade,
        sex: formData.sex,
        phone: formData.phone,
        guardian: formData.guardian,
        gphone: formData.gphone,
        sdate: new Date().toISOString().split("T")[0],
        country: formData.country,
        origin: formData.origin,
        address: formData.address,
      };
      setStudents([...students, newStudent]);
    }

    setFormData(initialForm());
    setEditingId(null);
    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      setStudents(students.filter((stu) => stu.id !== id));
    }
  };

  const handleEdit = (stu) => {
    setEditingId(stu.id);
    setFormData({
      fullName: stu.fullName,
      email: stu.email,
      dob: stu.dob,
      course: stu.course,
      grade: stu.grade,
      guardian: stu.guardian,
      phone: stu.phone,
      gphone: stu.gphone,
      gdob: stu.gdob || "",
      country: stu.country,
      origin: stu.origin,
      address: stu.address,
      sex: stu.sex,
      photo: null,
      preview: stu.photo,
    });
    setShowModal(true);
  };

  const filteredStudents = students.filter((stu) =>
    stu.id.toLowerCase().includes(searchId.toLowerCase())
  );

  // Pagination logic
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
      {/* Header */}
      <div className={styles.header}>
        <h1>Students</h1>
        <div className={styles.actions}>
          <input
            type="text"
            placeholder="Search by Student ID..."
            value={searchId}
            onChange={(e) => {
              setSearchId(e.target.value);
              setCurrentPage(1); // reset to page 1 when searching
            }}
            className={styles.search}
          />
          <button
            onClick={() => {
              setFormData(initialForm());
              setEditingId(null);
              setShowModal(true);
            }}
            className={styles.addBtn}
          >
            + Add Student
          </button>
        </div>
      </div>

      {/* Table */}
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
            {paginatedStudents.map((stu) => (
              <tr key={stu.id}>
                <td>{stu.id}</td>
                <td>
                  <img src={stu.photo} alt="student" className={styles.photo} />
                </td>
                <td>{stu.fullName}</td>
                <td>{stu.email}</td>
                <td>{stu.dob}</td>
                <td>{stu.course}</td>
                <td>{stu.grade}</td>
                <td>{stu.sex}</td>
                <td>{stu.phone}</td>
                <td>{stu.guardian}</td>
                <td>{stu.gphone}</td>
                <td>{stu.sdate}</td>
                <td>{stu.country}</td>
                <td>{stu.origin}</td>
                <td>{stu.address}</td>
                <td className={styles.actionsCol}>
                  <button
                    className={styles.editBtn}
                    onClick={() => handleEdit(stu)}
                  >
                    <FiEdit />
                  </button>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(stu.id)}
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination Controls */}
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

      {/* Modal */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>{editingId ? "Edit Student" : "Add Student"}</h2>
            <form className={styles.form} onSubmit={handleSubmit}>
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="course"
                placeholder="Course"
                value={formData.course}
                onChange={handleChange}
              />
              <input
                type="text"
                name="grade"
                placeholder="Grade Level"
                value={formData.grade}
                onChange={handleChange}
              />
              <input
                type="text"
                name="guardian"
                placeholder="Guardian Name"
                value={formData.guardian}
                onChange={handleChange}
              />
              <input
                type="text"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
              />
              <input
                type="text"
                name="gphone"
                placeholder="Guardian Phone Number"
                value={formData.gphone}
                onChange={handleChange}
              />
              <input
                type="date"
                name="gdob"
                value={formData.gdob}
                onChange={handleChange}
              />
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
              >
                <option value="">Select Country</option>
                {countries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <input
                type="text"
                name="origin"
                placeholder="State of Origin"
                value={formData.origin}
                onChange={handleChange}
              />
              <input
                type="text"
                name="address"
                placeholder="Address"
                value={formData.address}
                onChange={handleChange}
              />
              <select
                name="sex"
                value={formData.sex}
                onChange={handleChange}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <input
                type="file"
                name="photo"
                accept="image/*"
                onChange={handleChange}
              />
              {formData.preview && (
                <img
                  src={formData.preview}
                  alt="preview"
                  className={styles.preview}
                />
              )}

              <div className={styles.modalActions}>
                <button type="submit" className={styles.saveBtn}>
                  {editingId ? "Update" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingId(null);
                    setFormData(initialForm());
                  }}
                  className={styles.cancelBtn}
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
