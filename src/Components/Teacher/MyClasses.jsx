import { useEffect, useState } from "react";
import "./Teacher.css";

const MyClasses = ({ courseId }) => {
  const [course, setCourse] = useState(null);
  const [newSectionName, setNewSectionName] = useState("");
  const [newClass, setNewClass] = useState({
    name: "",
    modules: "",
    hours: "",
    description: "",
    date: "",
    time: "",
  });
  const [newAssignment, setNewAssignment] = useState({
    title: "",
    description: "",
    dueDate: "",
  });
  const [grading, setGrading] = useState({});
  const [editingSectionIndex, setEditingSectionIndex] = useState(null);
  const [editingSectionName, setEditingSectionName] = useState("");

  useEffect(() => {
    fetchCourse();
  }, []);

  const fetchCourse = async () => {
    try {
      const res = await fetch(`/course/${courseId}`);
      const data = await res.json();
      setCourse(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchCourse(); }, []);

  // SECTION HANDLERS
  const addSection = async () => {
    if (!newSectionName) return;
    const res = await fetch(`/course/${courseId}/section`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newSectionName }),
    });
    const data = await res.json();
    setCourse((prev) => ({ ...prev, sections: data }));
    setNewSectionName("");
  };

  const renameSection = async (index) => {
    if (!editingSectionName) return;
    const res = await fetch(`/course/${courseId}/section/${index}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editingSectionName }),
    });
    const data = await res.json();
    setCourse((prev) => {
      const updatedSections = [...prev.sections];
      updatedSections[index] = data;
      return { ...prev, sections: updatedSections };
    });
    setEditingSectionIndex(null);
    setEditingSectionName("");
  };

  const deleteSection = async (index) => {
    if (!window.confirm("Delete this section?")) return;
    const res = await fetch(`/course/${courseId}/section/${index}`, {
      method: "DELETE",
    });
    const data = await res.json();
    setCourse((prev) => ({ ...prev, sections: data }));
  };

  // CLASS HANDLERS
  const addClass = async (sectionIndex) => {
    const res = await fetch(`/course/${courseId}/section/${sectionIndex}/subject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newClass),
    });
    const data = await res.json();
    setCourse((prev) => {
      const updatedSections = [...prev.sections];
      updatedSections[sectionIndex].subjects = data;
      return { ...prev, sections: updatedSections };
    });
    setNewClass({ name: "", modules: "", hours: "", description: "", date: "", time: "" });
  };

  const updateClass = async (sectionIndex, subjectIndex) => {
    const subject = course.sections[sectionIndex].subjects[subjectIndex];
    const res = await fetch(
      `/course/${courseId}/section/${sectionIndex}/subject/${subjectIndex}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subject),
      }
    );
    const data = await res.json();
    setCourse((prev) => {
      const updatedSections = [...prev.sections];
      updatedSections[sectionIndex].subjects[subjectIndex] = data;
      return { ...prev, sections: updatedSections };
    });
  };

  const deleteClass = async (sectionIndex, subjectIndex) => {
    if (!window.confirm("Delete this class?")) return;
    const res = await fetch(
      `/course/${courseId}/section/${sectionIndex}/subject/${subjectIndex}`,
      { method: "DELETE" }
    );
    const data = await res.json();
    setCourse((prev) => {
      const updatedSections = [...prev.sections];
      updatedSections[sectionIndex].subjects = data;
      return { ...prev, sections: updatedSections };
    });
  };

  // ASSIGNMENT HANDLERS
  const addAssignment = async (sectionIndex, subjectIndex) => {
    const res = await fetch(
      `/course/${courseId}/section/${sectionIndex}/subject/${subjectIndex}/assignment`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAssignment),
      }
    );
    const data = await res.json();
    setCourse((prev) => {
      const updatedSections = [...prev.sections];
      updatedSections[sectionIndex].subjects[subjectIndex].assignments = data;
      return { ...prev, sections: updatedSections };
    });
    setNewAssignment({ title: "", description: "", dueDate: "" });
  };

  const gradeSubmission = async (sectionIndex, subjectIndex, assignmentIndex, studentId) => {
    const key = `${assignmentIndex}_${studentId}`;
    const { grade, score } = grading[key] || {};
    if (!grade && !score) return;
    const res = await fetch(
      `/course/${courseId}/section/${sectionIndex}/subject/${subjectIndex}/assignment/${assignmentIndex}/grade`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, grade, score }),
      }
    );
    await res.json();
    fetchCourse();
  };

  if (!course) return <div>Loading...</div>;

  return (
    <div className="my-classes-page">
      <h1>Course: {course.title}</h1>

      <div className="sections">
        <h2>Sections</h2>
        <input
          type="text"
          placeholder="New section name"
          value={newSectionName}
          onChange={(e) => setNewSectionName(e.target.value)}
        />
        <button onClick={addSection}>Add Section</button>

        {course.sections.map((section, si) => (
          <div key={si} className="section">
            <div className="section-header">
              {editingSectionIndex === si ? (
                <>
                  <input
                    type="text"
                    value={editingSectionName}
                    onChange={(e) => setEditingSectionName(e.target.value)}
                  />
                  <button onClick={() => renameSection(si)}>Save</button>
                </>
              ) : (
                <>
                  <h3>{section.name}</h3>
                  <div>
                    <button onClick={() => {
                      setEditingSectionIndex(si);
                      setEditingSectionName(section.name);
                    }}>Rename</button>
                    <button onClick={() => deleteSection(si)}>Delete</button>
                  </div>
                </>
              )}
            </div>

            <div className="classes">
              <h4>Classes</h4>
              <input
                type="text"
                placeholder="Class name"
                value={newClass.name}
                onChange={(e) => setNewClass((prev) => ({ ...prev, name: e.target.value }))}
              />
              <input
                type="date"
                value={newClass.date}
                onChange={(e) => setNewClass((prev) => ({ ...prev, date: e.target.value }))}
              />
              <input
                type="time"
                value={newClass.time}
                onChange={(e) => setNewClass((prev) => ({ ...prev, time: e.target.value }))}
              />
              <button onClick={() => addClass(si)}>Add Class</button>

              {section.subjects.map((subject, subjIndex) => (
                <div key={subjIndex} className="class-card">
                  <div className="class-header">
                    <strong>{subject.name}</strong> - {subject.date} {subject.time}
                    <div>
                      <button onClick={() => updateClass(si, subjIndex)}>Edit</button>
                      <button onClick={() => deleteClass(si, subjIndex)}>Delete</button>
                    </div>
                  </div>

                  <div className="assignments">
                    <h5>Assignments</h5>
                    <input
                      type="text"
                      placeholder="Title"
                      value={newAssignment.title}
                      onChange={(e) => setNewAssignment((prev) => ({ ...prev, title: e.target.value }))}
                    />
                    <input
                      type="text"
                      placeholder="Description"
                      value={newAssignment.description}
                      onChange={(e) => setNewAssignment((prev) => ({ ...prev, description: e.target.value }))}
                    />
                    <input
                      type="date"
                      value={newAssignment.dueDate}
                      onChange={(e) => setNewAssignment((prev) => ({ ...prev, dueDate: e.target.value }))}
                    />
                    <button onClick={() => addAssignment(si, subjIndex)}>Add Assignment</button>

                    <table className="submissions-table">
                      <thead>
                        <tr>
                          <th>Student ID</th>
                          <th>Grade</th>
                          <th>Score</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subject.assignments.map((assignment, aIdx) => (
                          <>
                            {assignment.submissions.map((sub) => {
                              const key = `${aIdx}_${sub.studentId}`;
                              return (
                                <tr key={key}>
                                  <td>{sub.studentId}</td>
                                  <td>
                                    <input
                                      type="text"
                                      value={grading[key]?.grade || sub.grade || ""}
                                      onChange={(e) =>
                                        setGrading((prev) => ({ ...prev, [key]: { ...prev[key], grade: e.target.value } }))
                                      }
                                    />
                                  </td>
                                  <td>
                                    <input
                                      type="number"
                                      value={grading[key]?.score || sub.score || ""}
                                      onChange={(e) =>
                                        setGrading((prev) => ({ ...prev, [key]: { ...prev[key], score: e.target.value } }))
                                      }
                                    />
                                  </td>
                                  <td>
                                    <button onClick={() => gradeSubmission(si, subjIndex, aIdx, sub.studentId)}>Save</button>
                                  </td>
                                </tr>
                              );
                            })}

                            {/* Pending Submissions */}
                            <tr>
                              <td colSpan={4}>
                                <div className="pending-submissions">
                                  <strong>Pending Submissions:</strong>
                                  <ul>
                                    {course.enrolledStudents
                                      .filter((sid) => !assignment.submissions.some((sub) => sub.studentId === sid))
                                      .map((sid) => (
                                        <li key={sid}>{sid}</li>
                                      ))}
                                  </ul>
                                </div>
                              </td>
                            </tr>
                          </>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyClasses;
