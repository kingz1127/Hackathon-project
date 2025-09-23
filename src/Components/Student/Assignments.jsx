import React from 'react';

// Assignment Card Component
function AssignmentCard({ assignment, onSubmit, onViewDetails }) {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return '#10b981';
      case 'overdue': return '#ef4444';
      case 'pending': return '#f59e0b';
      case 'graded': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getDaysRemaining = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysLeft = getDaysRemaining(assignment.dueDate);

  return (
    <div style={{...styles.assignmentCard, borderLeft: `4px solid ${getPriorityColor(assignment.priority)}`}}>
      <div style={styles.cardHeader}>
        <div>
          <h3 style={styles.assignmentTitle}>{assignment.title}</h3>
          <p style={styles.courseName}>{assignment.course}</p>
        </div>
        <div style={{...styles.statusBadge, backgroundColor: getStatusColor(assignment.status)}}>
          {assignment.status.toUpperCase()}
        </div>
      </div>
      
      <p style={styles.assignmentDescription}>{assignment.description}</p>
      
      <div style={styles.assignmentMeta}>
        <div style={styles.metaItem}>
          <span style={styles.metaLabel}>Due Date:</span>
          <span style={styles.metaValue}>{assignment.dueDate}</span>
        </div>
        <div style={styles.metaItem}>
          <span style={styles.metaLabel}>Instructor:</span>
          <span style={styles.metaValue}>{assignment.instructor}</span>
        </div>
        <div style={styles.metaItem}>
          <span style={styles.metaLabel}>Points:</span>
          <span style={styles.metaValue}>{assignment.points} pts</span>
        </div>
      </div>

      {daysLeft >= 0 && assignment.status === 'pending' && (
        <div style={{...styles.dueAlert, backgroundColor: daysLeft <= 2 ? '#fef2f2' : '#f0fdf4'}}>
          <span style={{color: daysLeft <= 2 ? '#dc2626' : '#059669'}}>
            {daysLeft === 0 ? 'Due Today!' : daysLeft === 1 ? 'Due Tomorrow' : `${daysLeft} days remaining`}
          </span>
        </div>
      )}

      {assignment.status === 'graded' && (
        <div style={styles.gradeDisplay}>
          <span style={styles.gradeLabel}>Grade:</span>
          <span style={{...styles.gradeValue, color: assignment.grade >= 80 ? '#10b981' : assignment.grade >= 60 ? '#f59e0b' : '#ef4444'}}>
            {assignment.grade}%
          </span>
        </div>
      )}

      <div style={styles.cardActions}>
        <button style={styles.viewButton} onClick={() => onViewDetails(assignment.id)}>
          View Details
        </button>
        {assignment.status === 'pending' && (
          <button style={styles.submitButton} onClick={() => onSubmit(assignment.id)}>
            Submit Assignment
          </button>
        )}
        {assignment.status === 'submitted' && (
          <button style={{...styles.submitButton, backgroundColor: '#6b7280'}} disabled>
            Submitted ✓
          </button>
        )}
      </div>
    </div>
  );
}

// Filter Component
function AssignmentFilter({ activeFilter, setActiveFilter, searchTerm, setSearchTerm }) {
  const filters = [
    { key: 'all', label: 'All Assignments', count: 12 },
    { key: 'pending', label: 'Pending', count: 5 },
    { key: 'submitted', label: 'Submitted', count: 4 },
    { key: 'graded', label: 'Graded', count: 2 },
    { key: 'overdue', label: 'Overdue', count: 1 }
  ];

  return (
    <div style={styles.filterContainer}>
      <div style={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search assignments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
        <div style={styles.searchIcon}>🔍</div>
      </div>
      
      <div style={styles.filterButtons}>
        {filters.map(filter => (
          <button
            key={filter.key}
            style={{
              ...styles.filterButton,
              ...(activeFilter === filter.key ? styles.activeFilter : {})
            }}
            onClick={() => setActiveFilter(filter.key)}
          >
            {filter.label}
            <span style={styles.filterCount}>({filter.count})</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// Stats Component
function AssignmentStats({ assignments }) {
  const stats = [
    {
      title: "Total Assignments",
      value: assignments.length,
      icon: "📚",
      color: "#3b82f6"
    },
    {
      title: "Pending",
      value: assignments.filter(a => a.status === 'pending').length,
      icon: "⏳",
      color: "#f59e0b"
    },
    {
      title: "Submitted",
      value: assignments.filter(a => a.status === 'submitted').length,
      icon: "✅",
      color: "#10b981"
    },
    {
      title: "Average Grade",
      value: assignments.filter(a => a.status === 'graded').length > 0 
        ? Math.round(assignments.filter(a => a.status === 'graded').reduce((acc, a) => acc + a.grade, 0) / assignments.filter(a => a.status === 'graded').length) + '%'
        : 'N/A',
      icon: "🎯",
      color: "#8b5cf6"
    }
  ];

  return (
    <div style={styles.statsContainer}>
      {stats.map((stat, index) => (
        <div key={index} style={{...styles.statCard, borderLeft: `4px solid ${stat.color}`}}>
          <div style={styles.statIcon}>{stat.icon}</div>
          <div style={styles.statContent}>
            <div style={styles.statValue}>{stat.value}</div>
            <div style={styles.statTitle}>{stat.title}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Assignments() {
  const [activeFilter, setActiveFilter] = React.useState('all');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [assignments] = React.useState([
    {
      id: 1,
      title: "React E-commerce Platform",
      course: "Full Stack Development",
      description: "Build a complete e-commerce platform using React, Node.js, and MongoDB. Include user authentication, product catalog, shopping cart, and payment integration.",
      dueDate: "2025-12-20",
      instructor: "Dr. Johnson",
      points: 100,
      priority: "high",
      status: "pending"
    },
    {
      id: 2,
      title: "REST API Development",
      course: "Backend Development",
      description: "Create RESTful APIs with proper authentication, error handling, and documentation using Node.js and Express.",
      dueDate: "2025-12-22",
      instructor: "Ms. Chen",
      points: 80,
      priority: "medium",
      status: "submitted"
    },
    {
      id: 3,
      title: "Database Design Project",
      course: "Database Systems",
      description: "Design and implement a normalized database schema for a library management system with proper relationships and constraints.",
      dueDate: "2025-12-18",
      instructor: "Prof. Williams",
      points: 90,
      priority: "high",
      status: "graded",
      grade: 87
    },
    {
      id: 4,
      title: "Cloud Deployment Assignment",
      course: "DevOps & CI/CD",
      description: "Deploy a microservices application on AWS using Docker containers and implement CI/CD pipeline with automated testing.",
      dueDate: "2025-12-25",
      instructor: "Mr. Anderson",
      points: 120,
      priority: "medium",
      status: "pending"
    },
    {
      id: 5,
      title: "Machine Learning Model",
      course: "Data Science",
      description: "Build and train a machine learning model for sentiment analysis using Python and scikit-learn.",
      dueDate: "2025-12-15",
      instructor: "Dr. Kim",
      points: 85,
      priority: "high",
      status: "overdue"
    },
    {
      id: 6,
      title: "Mobile App Development",
      course: "Mobile Development",
      description: "Create a cross-platform mobile application using React Native with offline capabilities and push notifications.",
      dueDate: "2025-12-28",
      instructor: "Ms. Taylor",
      points: 95,
      priority: "low",
      status: "pending"
    },
    {
      id: 7,
      title: "Security Audit Report",
      course: "Cybersecurity",
      description: "Conduct a comprehensive security audit of a web application and provide detailed recommendations for improvements.",
      dueDate: "2025-12-30",
      instructor: "Prof. Brown",
      points: 75,
      priority: "medium",
      status: "submitted"
    },
    {
      id: 8,
      title: "UI/UX Design Portfolio",
      course: "Design Principles",
      description: "Create a comprehensive design portfolio showcasing user interface and user experience design skills with case studies.",
      dueDate: "2025-12-19",
      instructor: "Ms. Davis",
      points: 70,
      priority: "low",
      status: "graded",
      grade: 92
    }
  ]);

  const handleSubmit = (assignmentId) => {
    alert(`Opening submission portal for assignment ${assignmentId}`);
    // In real app, this would open a file upload modal or redirect to submission page
  };

  const handleViewDetails = (assignmentId) => {
    alert(`Viewing details for assignment ${assignmentId}`);
    // In real app, this would show detailed assignment requirements, rubric, etc.
  };

  // Filter assignments based on active filter and search term
  const filteredAssignments = assignments.filter(assignment => {
    const matchesFilter = activeFilter === 'all' || assignment.status === activeFilter;
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.pageTitle}>My Assignments</h1>
        <p style={styles.pageSubtitle}>Track your assignments, submit work, and monitor your progress</p>
      </div>

      <AssignmentStats assignments={assignments} />
      
      <AssignmentFilter 
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      <div style={styles.assignmentsContainer}>
        {filteredAssignments.length === 0 ? (
          <div style={styles.noAssignments}>
            <div style={styles.noAssignmentsIcon}>📝</div>
            <h3 style={styles.noAssignmentsTitle}>No assignments found</h3>
            <p style={styles.noAssignmentsText}>
              {searchTerm ? 'Try adjusting your search terms.' : 'No assignments match the selected filter.'}
            </p>
          </div>
        ) : (
          <div style={styles.assignmentGrid}>
            {filteredAssignments.map(assignment => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                onSubmit={handleSubmit}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    backgroundColor: '#f8fafc',
    minHeight: '100vh'
  },
  header: {
    marginBottom: '30px'
  },
  pageTitle: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#0a174e',
    margin: '0 0 8px 0'
  },
  pageSubtitle: {
    fontSize: '1.2rem',
    color: '#64748b',
    margin: 0
  },
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  statIcon: {
    fontSize: '2rem',
    padding: '12px',
    borderRadius: '12px',
    backgroundColor: '#f8fafc'
  },
  statContent: {
    flex: 1
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#1e293b',
    margin: 0
  },
  statTitle: {
    fontSize: '0.875rem',
    color: '#64748b',
    margin: '4px 0 0 0'
  },
  filterContainer: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: '30px'
  },
  searchContainer: {
    position: 'relative',
    marginBottom: '20px'
  },
  searchInput: {
    width: '100%',
    padding: '12px 45px 12px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '16px',
    outline: 'none',
    transition: 'border-color 0.2s ease'
  },
  searchIcon: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#64748b'
  },
  filterButtons: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap'
  },
  filterButton: {
    padding: '8px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    backgroundColor: 'white',
    color: '#64748b',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  activeFilter: {
    backgroundColor: '#3b82f6',
    color: 'white',
    borderColor: '#3b82f6'
  },
  filterCount: {
    fontSize: '12px',
    opacity: 0.8
  },
  assignmentsContainer: {
    marginTop: '20px'
  },
  assignmentGrid: {
    display: 'grid',
    gap: '20px'
  },
  assignmentCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px'
  },
  assignmentTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1e293b',
    margin: '0 0 4px 0'
  },
  courseName: {
    fontSize: '0.875rem',
    color: '#3b82f6',
    margin: 0,
    fontWeight: '500'
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: 'white',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  assignmentDescription: {
    fontSize: '0.875rem',
    color: '#64748b',
    lineHeight: '1.6',
    margin: '0 0 20px 0'
  },
  assignmentMeta: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px',
    marginBottom: '20px',
    padding: '16px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px'
  },
  metaItem: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  metaLabel: {
    fontSize: '0.875rem',
    color: '#64748b',
    fontWeight: '500'
  },
  metaValue: {
    fontSize: '0.875rem',
    color: '#1e293b',
    fontWeight: '600'
  },
  dueAlert: {
    padding: '12px 16px',
    borderRadius: '8px',
    margin: '16px 0',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: '0.875rem'
  },
  gradeDisplay: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    backgroundColor: '#f0f9ff',
    borderRadius: '8px',
    margin: '16px 0'
  },
  gradeLabel: {
    fontSize: '0.875rem',
    color: '#64748b',
    fontWeight: '500'
  },
  gradeValue: {
    fontSize: '1.125rem',
    fontWeight: 'bold'
  },
  cardActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '20px'
  },
  viewButton: {
    padding: '10px 20px',
    border: '2px solid #3b82f6',
    borderRadius: '8px',
    backgroundColor: 'transparent',
    color: '#3b82f6',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    flex: 1
  },
  submitButton: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#3b82f6',
    color: 'white',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    flex: 1
  },
  noAssignments: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  noAssignmentsIcon: {
    fontSize: '4rem',
    marginBottom: '16px'
  },
  noAssignmentsTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#1e293b',
    margin: '0 0 8px 0'
  },
  noAssignmentsText: {
    fontSize: '1rem',
    color: '#64748b',
    margin: 0
  }
};