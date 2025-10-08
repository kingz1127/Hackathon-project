import '../Widget.css';

const WidgetHeader = ({ onClose }) => {
  return (
    <div className="widget-header">
      <div className="header-content">
        <div className="logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
          </svg>
          <span>Visonaj</span>
        </div>
        <div className="header-actions">
          <div className="avatar">CN</div>
          <button className="close-btn" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
      <div className="greeting">
        <h2>Hello Chinonye!</h2>
        <p>How can we help?</p>
      </div>
    </div>
  );
};

export default WidgetHeader;
