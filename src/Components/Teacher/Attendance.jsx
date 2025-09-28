import { useEffect, useState } from "react";
import "./Teacher.css";

export default function Attendance(){
  const [students, setStudents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 5;

  useEffect(() => {
    fetch("http://localhost:5000/admin/students")
      .then((res) => res.json())
      .then((data) => setStudents(data))
      .catch((err) => console.error(err));
  }, []);

  // Pagination
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = students.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalPages = Math.ceil(students.length / studentsPerPage);

  return (
    <div className="attendance-container">
      {/* LEFT SIDE (Filters + Table) */}
      <div className="left-section">
        <div className="filters-box">
          <h3>Subject Attendance</h3>
          <div className="filters">
            <select><option>Faculty of CS</option></select>
            <select><option>BSCS</option></select>
            <select><option>FALL 22</option></select>
            <select><option>CS001-IT</option></select>
            <button>Search</button>
          </div>
        </div>

        <div className="table-box">
          <table>
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Present</th>
                <th>Absent</th>
                <th>Leave</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {currentStudents.map((student) => (
                <tr key={student._id}>
                  <td>{student.studentId}</td>
                  <td>{student.fullName}</td>
                  <td><input type="radio" name={`status-${student._id}`} /></td>
                  <td><input type="radio" name={`status-${student._id}`} /></td>
                  <td><input type="radio" name={`status-${student._id}`} /></td>
                  <td>Note</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>Prev</button>
            <span>{currentPage} / {totalPages}</span>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE (Calendar + Totals) */}
      <div className="right-section">
        <div className="calendar-box">
          <h3>Jan 2023</h3>
          <div className="calendar">
            {[...Array(31)].map((_, i) => (
              <div key={i} className={i + 1 === 9 ? "day active" : "day"}>
                {i + 1}
              </div>
            ))}
          </div>
        </div>

        <div className="totals-box">
          <div className="total yellow">240 Total Students</div>
          <div className="total green">230 Present Today</div>
          <div className="total red">10 Absent Today</div>
        </div>
      </div>
    </div>
  );
};


