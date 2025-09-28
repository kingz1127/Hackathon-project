import { useEffect, useState } from "react";
import { FaCommentDots, FaTimes } from "react-icons/fa";
import "./TeacherChatBubble.css";

export default function TeacherChatBubble({ teacherId, teacherName, studentId, studentName }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch chat messages and count unread
  const fetchMessages = async () => {
    try {
      const res = await fetch(`http://localhost:5000/messages/chat/${studentId}/${teacherId}`);
      const data = await res.json();
      if (res.ok) {
        setMessages(data);

        // Count unread teacher messages
        const unread = data.filter(msg => !msg.isRead && msg.senderId === teacherId).length;
        setUnreadCount(unread);
      }
    } catch (err) {
      console.error("Error fetching chat:", err);
    }
  };

  // Poll messages every 3 seconds
  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [studentId, teacherId]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    try {
      const res = await fetch("http://localhost:5000/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: studentId,
          senderName: studentName,
          receiverId: teacherId,
          content: input,
        }),
      });

      if (res.ok) {
        setInput("");
        fetchMessages(); // Refresh chat immediately
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0); // reset unread when opening
    }
  };

  return (
    <div className="teacher-chat-bubble">
      {/* Floating button with unread badge */}
      {!isOpen && (
        <button className="chat-btn" onClick={toggleChat}>
          <FaCommentDots size={24} />
          {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <span>Chat with {teacherName || "Teacher"}</span>
            <button onClick={toggleChat}><FaTimes /></button>
          </div>

          <div className="chat-messages">
            {messages.length === 0 && <p className="no-messages">Start the conversation!</p>}
            {messages.map((msg, idx) => (
              <div
                key={msg._id || idx}
                className={msg.senderId === studentId ? "msg-sent" : "msg-received"}
              >
                <span>{msg.content}</span>
                <small>{msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ""}</small>
              </div>
            ))}
          </div>

          <div className="chat-input">
            <input
              type="text"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <button onClick={handleSendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}
