// src/pages/MyCourses.jsx
import { useEffect, useState } from "react";
import { FaBookOpen, FaEdit, FaUpload, FaUserGraduate } from "react-icons/fa";
import "./Teacher.css"; // <-- your CSS

export default function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: "", description: "" });
  const teacherId = localStorage.getItem("teacherId"); // logged-in teacher


  const handleAddCourse = () => {
    setShowAddModal(true);
  };

  const handleSaveCourse = async () => {
    // TODO: call backend API to save course
    console.log("Saving course:", newCourse);
    setShowAddModal(false);
    setNewCourse({ title: "", description: "" });
  };

  useEffect(() => {
    // Fetch courses taught by this teacher
    fetch(`http://localhost:5000/courses/teacher/${teacherId}`)
      .then((res) => res.json())
      .then((data) => setCourses(data))
      .catch((err) => console.error("Error fetching courses:", err));
  }, [teacherId]);

  const handleUpload = (course) => {
    console.log("Upload resources for:", course.title);
    // TODO: open modal for upload
  };

  const handleEdit = (course) => {
    console.log("Edit course info:", course.title);
    // TODO: open modal for editing
  };

  return (
    <div className="myclasses-container">
      {/* Header */}
      <div className="myclasses-header">
        <h2>📚 My Courses</h2>
       <div>
      <button onClick={handleAddCourse}>+ Add New Course</button>

      {showAddModal && (
        <div className="modal">
          <h3>Add New Course</h3>
          <input
            type="text"
            placeholder="Course Title"
            value={newCourse.title}
            onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
          />
          <textarea
            placeholder="Course Description"
            value={newCourse.description}
            onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
          />
          <button onClick={handleSaveCourse}>Save</button>
          <button onClick={() => setShowAddModal(false)}>Cancel</button>
        </div>
      )}
    </div>
      </div>

      {/* Courses Grid */}
      <div className="classes-grid">
        {courses.map((course) => (
          <div key={course.id} className="class-card">
            <div className="class-title">
              <FaBookOpen className="icon" />
              <h3>{course.title}</h3>
            </div>
            <p className="class-desc">{course.description}</p>

            {/* Students & Grades */}
            {course.students && course.students.length > 0 && (
              <div className="class-students">
                <h4>
                  <FaUserGraduate /> Students
                </h4>
                <ul>
                  {course.students.map((stu) => (
                    <li key={stu.id}>
                      {stu.name} - <strong>{stu.grade || "N/A"}</strong>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Resources */}
            {course.resources && course.resources.length > 0 && (
              <div className="class-resources">
                <h4>Resources:</h4>
                <ul>
                  {course.resources.map((res, index) => (
                    <li key={index}>
                      <a href={res.url} target="_blank" rel="noopener noreferrer">
                        {res.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="class-actions">
              <button className="upload-btn" onClick={() => handleUpload(course)}>
                <FaUpload /> Upload
              </button>
              <button className="edit-btn" onClick={() => handleEdit(course)}>
                <FaEdit /> Edit
              </button>
            </div>
          </div>
        ))}

        {courses.length === 0 && (
          <p style={{ textAlign: "center", marginTop: "50px" }}>
            No courses found. Add a new course to get started.
          </p>
        )}
      </div>
    </div>
  );
}
