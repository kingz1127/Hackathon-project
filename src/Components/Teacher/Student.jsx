// src/pages/StudentsPage.jsx
import { useEffect, useState } from "react";
import "./Teacher.css";

export default function Student() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [studentName, setStudentName] = useState("Loading...");

  const teacherId = localStorage.getItem("teacherId");

  // ✅ Fetch students linked to teacher's course
  useEffect(() => {
    if (!teacherId) return;
    
    fetch(`http://localhost:5000/by-teacher/${teacherId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch students");
        return res.json();
      })
      .then((data) => setStudents(data))
      .catch((err) => console.error("Error fetching students:", err));
  }, [teacherId]);

  // ✅ Open chat modal & load history
  const openChat = async (student) => {
    setSelectedStudent(student);
    setChatOpen(true);
    setStudentName(student.fullName);

    try {
      const res = await fetch(
        `http://localhost:5000/messages/chat/${teacherId}/${student.studentId}`
      );
      const data = await res.json();
      if (res.ok) setChatMessages(data);
    } catch (err) {
      console.error("Error loading chat:", err);
    }
  };

  // ✅ Send message to the selected student
  const handleSendMessage = async () => {
    if (!message || !message.trim()) return;

    if (!teacherId) {
      alert("Teacher not logged in!");
      return;
    }

    if (!selectedStudent) {
      alert("No student selected for chat!");
      return;
    }

    try {
      // Get teacher name from localStorage or fetch it
      const teacherName = localStorage.getItem("teacherName") || "Teacher";

      const res = await fetch("http://localhost:5000/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: teacherId,
          senderName: teacherName,
          receiverId: selectedStudent.studentId,
          content: message,
        }),
      });

      if (!res.ok) throw new Error("Failed to send message");

      const data = await res.json();
      console.log("Server response:", data); // Debug log

      // ✅ Update chat instantly only if we got valid data
      if (data && data._id) {
  setMessage("");
  setStatus("Message sent successfully!");
  setTimeout(() => setStatus(""), 3000);

  // refresh chat
  const res = await fetch(
    `http://localhost:5000/messages/chat/${teacherId}/${selectedStudent.studentId}`
  );
  const updatedMessages = await res.json();
  if (res.ok) setChatMessages(updatedMessages);
}
 else {
        console.error("Invalid response data:", data);
        alert("Message may not have been saved properly");
      }

    } catch (err) {
      console.error("Error sending:", err);
      alert("Failed to send message");
    }
  };

  // messages 

  useEffect(() => {
  if (!chatOpen || !selectedStudent) return;

  const interval = setInterval(async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/messages/chat/${teacherId}/${selectedStudent.studentId}`
      );
      const data = await res.json();
      if (res.ok) setChatMessages(data);
    } catch (err) {
      console.error("Error fetching latest chat:", err);
    }
  }, 3000); // fetch every 3 seconds

  return () => clearInterval(interval); // cleanup on modal close
}, [chatOpen, selectedStudent, teacherId]);


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

      {status && <div className="status-message">{status}</div>}

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
            <th>ID</th>
            <th>Name</th>
            <th>Class</th>
            <th>Grade</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.map((student) => (
            <tr key={student._id}>
              <td>{student.studentId}</td>
              <td>{student.fullName}</td>
              <td>{student.className}</td>
              <td>{student.gradeLevel}</td>
              <td>
                <button className="view-btn" onClick={() => setSelectedStudent(student)}>
                  View
                </button>
                <button
                  className="message-btn"
                  onClick={() => openChat(student)}
                >
                  Message
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {filteredStudents.length === 0 && <p>No students found.</p>}

      {/* ✅ Modal for student details */}
      {selectedStudent && !chatOpen && (
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

      {/* ✅ Chat Modal */}
      {chatOpen && selectedStudent && (
        <div className="modal-overlay" onClick={() => setChatOpen(false)}>
          <div className="modal-content chat-box" onClick={(e) => e.stopPropagation()}>
            <h3>Chat with {selectedStudent.fullName}</h3>

            <div className="chat-messages">
              {chatMessages && chatMessages.length > 0 ? (
                chatMessages.map((msg, idx) => (
                  <div
                    key={msg._id || idx}
                    className={msg.senderId === teacherId ? "msg-sent" : "msg-received"}
                  >
                    <strong>{msg.senderName || "Unknown"}:</strong>
                    <span> {msg.content || msg.text || "No content"} </span>
                    <span className="timestamp">
                      {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : "No time"}
                    </span>
                  </div>
                ))
              ) : (
                <div className="no-messages">No messages yet. Start the conversation!</div>
              )}
            </div>

            <div className="chat-input">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button onClick={handleSendMessage}>Send</button>
            </div>

            <button className="close-btn" onClick={() => {
              setChatOpen(false);
              setSelectedStudent(null);
            }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}