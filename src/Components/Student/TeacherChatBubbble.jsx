import { FaTimes } from "react-icons/fa";
import "./TeacherChatBubble.css";

export default function TeacherChatBubble({
  messages = [],
  message,
  setMessage,
  sendMessage,
  teacherName = "Teacher",
  onClose,
  studentId,
  teacherId
}) {

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="teacher-chat-bubble">
      {/* Chat window */}
      <div className="chat-window">
        <div className="chat-header">
          <span>Chat with {teacherName}</span>
          <button onClick={onClose}><FaTimes /></button>
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
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}
