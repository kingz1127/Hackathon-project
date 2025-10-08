import '../Widget.css';

const HelpPage = () => {
  const helpCategories = [
    { id: 1, title: 'Getting Started', icon: '🚀', articles: 12 },
    { id: 2, title: 'Account & Billing', icon: '💳', articles: 8 },
    { id: 3, title: 'Technical Support', icon: '🔧', articles: 15 },
    { id: 4, title: 'Security & Privacy', icon: '🔒', articles: 6 }
  ];

  return (
    <div className="page help-page">
      <h3 className="page-title">Help Center</h3>
      <p className="page-subtitle">Browse our help articles and resources</p>
      
      <div className="help-categories">
        {helpCategories.map(category => (
          <div key={category.id} className="help-category">
            <div className="category-icon">{category.icon}</div>
            <div className="category-info">
              <h4>{category.title}</h4>
              <p>{category.articles} articles</p>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
        ))}
      </div>

      <div className="contact-support">
        <h4>Still need help?</h4>
        <button className="contact-btn">Contact Support</button>
      </div>
    </div>
  );
};

export default HelpPage;