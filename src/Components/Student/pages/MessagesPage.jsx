import '../Widget.css';

const MessagesPage = () => {
  const messages = [
    { id: 1, sender: 'Support Team', message: 'Welcome to chinonye! How can we help you today?', time: '10:30 AM', unread: true },
    { id: 2, sender: 'Technical Support', message: 'Your recent ticket has been resolved.', time: 'Yesterday', unread: false },
    { id: 3, sender: 'Billing', message: 'Payment confirmation for invoice #12345', time: '2 days ago', unread: false }
  ];

  return (
    <div className="page messages-page">
      <h3 className="page-title">Messages</h3>
      <div className="messages-list">
        {messages.map(msg => (
          <div key={msg.id} className={`message-item ${msg.unread ? 'unread' : ''}`}>
            <div className="message-avatar">
              {msg.sender.charAt(0)}
            </div>
            <div className="message-content">
              <div className="message-header">
                <span className="message-sender">{msg.sender}</span>
                <span className="message-time">{msg.time}</span>
              </div>
              <p className="message-text">{msg.message}</p>
            </div>
            {msg.unread && <div className="unread-badge"></div>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MessagesPage;

