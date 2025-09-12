// src/pages/StudentsPage.jsx
import { useState } from "react";
import "../Styles/Teacher.css";

const sampleStudents = [
  { id: 1, name: "Jude Opueh", grade: "Grade 10", class: "10A" },
  { id: 2, name: "Dolly P", grade: "Grade 9", class: "9B" },
  { id: 3, name: "TheWeird One ", grade: "Grade 11", class: "11C" },
];

export default function Student() {
  const [search, setSearch] = useState("");

  const filteredStudents = sampleStudents.filter((student) =>
    student.name.toLowerCase().includes(search.toLowerCase())
  );

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

        <select>
          <option value="">Filter by Grade</option>
          <option value="Grade 9">Grade 9</option>
          <option value="Grade 10">Grade 10</option>
          <option value="Grade 11">Grade 11</option>
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
            <tr key={student.id}>
              <td>{student.name}</td>
              <td>{student.class}</td>
              <td>{student.grade}</td>
              <td>
                <button className="view-btn">View</button>
                <button className="message-btn">Message</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
