// import { useEffect, useState } from 'react';
// import '../Widget.css';

// const MessagesPage = ({ studentId, senderId, senderName }) => {
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState('');
//   const [loading, setLoading] = useState(true);

//   // Fetch messages initially
//   useEffect(() => {
//     console.log(studentId, senderId, senderName,receiverId); // ✅ Debug log,
//     const fetchMessages = async () => {
//       try {
//         const res = await fetch(`http://localhost:5000/messages/student/${studentId}`);
//         const data = await res.json();
//         setMessages(data);
//       } catch (err) {
//         console.error('Error fetching messages:', err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchMessages();
//   }, [studentId]);

//   // Real-time updates via SSE
//   useEffect(() => {
//     const evtSource = new EventSource(`http://localhost:5000/messages/stream/${studentId}`);
//     evtSource.onmessage = e => {
//       const newMessages = JSON.parse(e.data);
//       setMessages(newMessages);
//     };
//     return () => evtSource.close();
//   }, [studentId]);

//   // Send a message
//  const handleSend = async () => {
//   const senderId = localStorage.getItem("studentId") || senderId;
//   const senderName = localStorage.getItem("studentName") || senderName;
//   const receiverId = studentId; // Make sure studentId prop exists

//   console.log({ senderId, senderName, receiverId, content: newMessage }); // ✅ Debug log

//   if (!newMessage.trim()) return;
//   if (!senderId || !senderName || !receiverId) {
//     console.error("Missing sender or receiver details!");
//     alert("Missing sender or receiver details!");
//     return;
//   }

//   try {
//     const res = await fetch("http://localhost:5000/messages/send", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         senderId,
//         senderName,
//         receiverId,
//         content: newMessage,
//       }),
//     });

//     if (!res.ok) {
//       const error = await res.json();
//       console.error("Server error:", error);
//       return;
//     }

//     const data = await res.json();
//     setMessages((prev) => [...prev, data]);
//     setNewMessage("");
//   } catch (err) {
//     console.error("Error sending message:", err);
//   }
// };


//   if (loading) return <p>Loading messages...</p>;

//   return (
//     <div className="page messages-page">
//       {/* <h3 className="page-title">Messages</h3> */}

//       <div className="messages-list">
//         {messages.length === 0 && <p>No messages yet.</p>}
//         {messages.map(msg => (
//           <div
//            key={msg._id || `${msg.senderId}-${msg.timestamp}`}

//             className={`message-item ${
//               msg.senderId === senderId ? 'message-sent' : 'message-received'
//             } ${!msg.isRead ? 'unread' : ''}`}
//           >
//             <div className="message-avatar">
//               {msg.senderName ? msg.senderName.charAt(0) : 'S'}
//             </div>
//             <div className="message-content">
//               <div className="message-header">
//                 <span className="message-sender">{msg.senderName || msg.senderId}</span>
//                 <span className="message-time">{new Date(msg.timestamp).toLocaleString()}</span>
//               </div>
//               <p className="message-text">{msg.content}</p>
//             </div>
//             {!msg.isRead && <div className="unread-badge"></div>}
//           </div>
//         ))}
//       </div>

//       {/* Message Input */}
//       <div className="message-input-container">
//         <input
//           type="text"
//           placeholder="Type your message..."
//           value={newMessage}
//           onChange={e => setNewMessage(e.target.value)}
//           onKeyDown={e => e.key === 'Enter' && handleSend()}
//         />
//         <button onClick={handleSend}>Send</button>
//       </div>
//     </div>
//   );
// };

// export default MessagesPage;




import { useEffect, useState } from "react";
import "../Widget.css";

const MessagesPage = ({ studentId, senderId: propSenderId, senderName: propSenderName }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Helper to get initials safely
  const getInitials = (name) => {
    if (!name) return "S";
    return name
      .split(" ")
      .map((n) => n.charAt(0).toUpperCase())
      .join("");
  };

  // Fetch messages initially
  useEffect(() => {
    if (!studentId) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`http://localhost:5000/messages/student/${studentId}`);
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error("Error fetching messages:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [studentId]);

  // Real-time updates via SSE
  useEffect(() => {
    if (!studentId) return;

    const evtSource = new EventSource(`http://localhost:5000/messages/stream/${studentId}`);
    evtSource.onmessage = (e) => {
      const newMessages = JSON.parse(e.data);
      setMessages(newMessages);
    };
    return () => evtSource.close();
  }, [studentId]);

  // Send a message
  const handleSend = async () => {
    const senderId = localStorage.getItem("studentId") || propSenderId;
    const senderName = localStorage.getItem("studentName") || propSenderName;
    const receiverId = studentId;

    if (!newMessage.trim()) return;
    if (!senderId || !senderName || !receiverId) {
      console.error("Missing sender or receiver details!");
      alert("Missing sender or receiver details!");
      return;
    }

    const payload = {
      senderId,
      senderName,
      receiverId,
      content: newMessage,
    };

    try {
      const res = await fetch("http://localhost:5000/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        console.error("Server error:", error);
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

  return (
    <div className="page messages-page">
      <div className="messages-list">
        {messages.length === 0 && <p>No messages yet.</p>}
        {messages.map((msg, index) => (
          <div
            key={msg._id || `${msg.senderId ?? "unknown"}-${msg.timestamp ?? index}`}
            className={`message-item ${
              msg.senderId === (localStorage.getItem("studentId") || propSenderId)
                ? "message-sent"
                : "message-received"
            } ${!msg.isRead ? "unread" : ""}`}
          >
            <div className="message-avatar">{getInitials(msg.senderName)}</div>
            <div className="message-content">
              <div className="message-header">
                <span className="message-sender">{msg.senderName || msg.senderId}</span>
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

      {/* Message Input */}
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
