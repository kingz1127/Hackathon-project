import '../Widget.css';

const HomePage = () => {
  return (
    <div className="page home-page">
      <div className="status-card">
        <div className="status-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <div className="status-info">
          <h3>Status: All Systems Operational</h3>
          <p>Updated Oct 7, 20:03 UTC</p>
        </div>
      </div>

      <div className="search-box">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <input type="text" placeholder="Search for help" />
      </div>

      <div className="quick-links">
        <div className="link-item">
          <span>Reset Your Password</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </div>
        <div className="link-item">
          <span>Download PDFs / lecture notes / slides</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </div>
        <div className="link-item">
          <span>Check grades / exam results</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </div>
        <div className="link-item">
          <span>Billing & Payments</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
