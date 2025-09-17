// src/pages/StudentsPage.jsx
import { useEffect, useState } from "react";
import "./Teacher.css";

export default function Student() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null); // ✅ for modal

  const teacherId = localStorage.getItem("teacherId"); // stored at login

  // ✅ Fetch students linked to teacher’s course
  useEffect(() => {
    fetch(`http://localhost:5000/by-teacher/${teacherId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch students");
        return res.json();
      })
      .then((data) => setStudents(data))
      .catch((err) => console.error("Error fetching students:", err));
  }, [teacherId]);

  // ✅ Apply search + filter
  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.fullName
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesGrade = gradeFilter ? student.gradeLevel === gradeFilter : true;
    return matchesSearch && matchesGrade;
  });

  return (
    <div className="students-page">
      <h2>My Students</h2>

      {/* Controls */}
      <div className="student-controls">
        <input
          type="text"
          placeholder="Search student..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)}>
          <option value="">Filter by Grade</option>
          <option value="100">Grade 100</option>
          <option value="200">Grade 200</option>
          <option value="300">Grade 300</option>
        </select>
      </div>

      {/* Student List */}
      <table className="student-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Class</th>
            <th>Grade</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.map((student) => (
            <tr key={student._id}>
              <td>{student.fullName}</td>
              <td>{student.className}</td>
              <td>{student.gradeLevel}</td>
              <td>
                <button className="view-btn" onClick={() => setSelectedStudent(student)}>
                  View
                </button>
                <button className="message-btn">Message</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {filteredStudents.length === 0 && <p>No students found.</p>}

      {/* ✅ Modal for student details */}
      {selectedStudent && (
        <div className="modal-overlay" onClick={() => setSelectedStudent(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>👤 {selectedStudent.fullName}</h3>
            <p><strong>Class:</strong> {selectedStudent.className}</p>
            <p><strong>Grade Level:</strong> {selectedStudent.gradeLevel}</p>
            <p><strong>Email:</strong> {selectedStudent.email || "Not provided"}</p>
            <p><strong>DOB:</strong> {selectedStudent.dob || "Not provided"}</p>

            <button className="close-btn" onClick={() => setSelectedStudent(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
