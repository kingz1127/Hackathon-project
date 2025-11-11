import { useEffect, useState } from "react";
import "../Widget.css";

const MessagesPage = ({ studentId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [teacher, setTeacher] = useState(null); // { id, name }

  const getInitials = (name) => {
    if (!name) return "S";
    return name
      .split(" ")
      .map((n) => n.charAt(0).toUpperCase())
      .join("");
  };

  // Step 1: Fetch the teacher for this student
  useEffect(() => {
    if (!studentId) {
      console.error("❌ studentId missing");
      setLoading(false);
      return;
    }

    const fetchTeacher = async () => {
      try {
        const res = await fetch(`http://localhost:5000/students/${studentId}/teacher`);
        const data = await res.json(); // { teacherId, teacherName }
        setTeacher(data);
      } catch (err) {
        console.error("Error fetching teacher:", err);
      }
    };

    fetchTeacher();
  }, [studentId]);

  // Step 2: Fetch messages once we have teacher
  useEffect(() => {
    if (!studentId || !teacher?.teacherId) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/messages/conversation?studentId=${studentId}&teacherId=${teacher.teacherId}`
        );
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error("Error fetching messages:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [studentId, teacher]);

  // Step 3: SSE updates
  useEffect(() => {
    if (!studentId || !teacher?.teacherId) return;

    const evtSource = new EventSource(
      `http://localhost:5000/messages/stream?studentId=${studentId}&teacherId=${teacher.teacherId}`
    );
    evtSource.onmessage = (e) => {
      const newMessages = JSON.parse(e.data);
      setMessages(newMessages);
    };
    return () => evtSource.close();
  }, [studentId, teacher]);

  // Step 4: Send message
  const handleSend = async () => {
    if (!newMessage.trim() || !teacher?.teacherId) return;

    const payload = {
      senderId: studentId,
      senderName: localStorage.getItem("studentName") || "Student",
      receiverId: teacher.teacherId,
      content: newMessage,
    };

    try {
      const res = await fetch("http://localhost:5000/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        console.error("Server error:", await res.json());
        return;
      }
      const data = await res.json();
      setMessages((prev) => [...prev, data]);
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  if (loading) return <p>Loading messages...</p>;
  if (!teacher) return <p>Fetching teacher info...</p>;

  return (
    <div className="page messages-page">
      <div className="messages-list">
        {messages.length === 0 && <p>No messages yet.</p>}
        {messages.map((msg, index) => (
          <div
            key={msg._id || index}
            className={`message-item ${
              msg.senderId === studentId ? "message-sent" : "message-received"
            } ${!msg.isRead ? "unread" : ""}`}
          >
            <div className="message-avatar">{getInitials(msg.senderName)}</div>
            <div className="message-content">
              <div className="message-header">
                <span className="message-sender">{msg.senderName}</span>
                <span className="message-time">
                  {new Date(msg.timestamp).toLocaleString()}
                </span>
              </div>
              <p className="message-text">{msg.content}</p>
            </div>
            {!msg.isRead && <div className="unread-badge"></div>}
          </div>
        ))}
      </div>

      <div className="message-input-container">
        <input
          type="text"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default MessagesPage;
